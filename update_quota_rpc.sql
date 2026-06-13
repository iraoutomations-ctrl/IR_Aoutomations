-- ==========================================================================
-- autoRI-studio CRM: שדרוג פונקציית Quota Check למניעת פערי ספירה
-- יש להריץ קוד זה ב-SQL Editor ב-Supabase
-- ==========================================================================

CREATE OR REPLACE FUNCTION check_automation_quota(p_automation_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_runs_count INTEGER := 0;
    v_runs_count_detailed INTEGER := 0;
    v_runs_count_daily INTEGER := 0;
    v_runs_goal INTEGER;
    v_extra_allowance INTEGER;
    v_block_on_limit BOOLEAN;
    v_custom_overage_rate NUMERIC;
    v_runs_limit INTEGER;
    v_allowed BOOLEAN;
    v_reason TEXT;
    
    -- משתנים לחילוץ מזהי ה-Workflows של האוטומציה
    v_n8n_workflow_id TEXT;
    v_n8n_workflows JSONB;
    v_wf_id_array TEXT[] := ARRAY[]::TEXT[];
    v_cutoff TIMESTAMP;
BEGIN
    -- 1. שליפת הגדרות האוטומציה ומזהי הוורקפלאוז
    SELECT 
        COALESCE(runs_goal, 0),
        COALESCE(extra_runs_allowance, 0),
        COALESCE(block_on_limit, true),
        COALESCE(custom_overage_rate, 0.05),
        n8n_workflow_id,
        n8n_workflows
    INTO 
        v_runs_goal,
        v_extra_allowance,
        v_block_on_limit,
        v_custom_overage_rate,
        v_n8n_workflow_id,
        v_n8n_workflows
    FROM automations
    WHERE id = p_automation_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'Automation not found'
        );
    END IF;

    -- חישוב גבול הריצות הכולל (חבילה בסיסית + תוספת ידנית)
    v_runs_limit := v_runs_goal + v_extra_allowance;

    -- 2. חילוץ מזהי הוורקפלאוז כדי לספור נכון גם ריצות ללא automation_id (על פי n8n_workflow_id)
    IF v_n8n_workflow_id IS NOT NULL AND v_n8n_workflow_id <> '' THEN
        SELECT ARRAY_AGG(TRIM(val)) INTO v_wf_id_array 
        FROM UNNEST(STRING_TO_ARRAY(v_n8n_workflow_id, ',')) AS val;
    END IF;
    
    IF v_n8n_workflows IS NOT NULL THEN
        DECLARE
            wf_item RECORD;
        BEGIN
            FOR wf_item IN SELECT jsonb_array_elements(v_n8n_workflows) AS element LOOP
                v_wf_id_array := ARRAY_APPEND(v_wf_id_array, TRIM(wf_item.element->>'id'));
            END LOOP;
        EXCEPTION WHEN OTHERS THEN
            -- התעלמות משגיאות פירסור
        END;
    END IF;

    -- הגדרת גבול 7 ימים למניעת כפל ספירה מול ה-Daily Rollups (בדומה למיזוג בפרונטאנד)
    v_cutoff := NOW() - INTERVAL '7 days';

    -- 3. ספירת ריצות מפורטות מהשבוע האחרון (בחודש הנוכחי)
    SELECT COALESCE(COUNT(*)::INTEGER, 0)
    INTO v_runs_count_detailed
    FROM automation_runs
    WHERE (automation_id = p_automation_id OR (n8n_workflow_id = ANY(v_wf_id_array)))
      AND created_at >= date_trunc('month', now())
      AND created_at >= v_cutoff
      -- סינון ריצות שנחסמו כדי שלא יאכלו את המכסה במידה ונגדיל אותה
      AND (status != 'error' OR error_type NOT LIKE '%נחסמה%');

    -- 4. ספירת ריצות היסטוריות מה-Daily Rollups (מעבר ל-7 ימים, בחודש הנוכחי)
    SELECT COALESCE(SUM(total_runs)::INTEGER, 0)
    INTO v_runs_count_daily
    FROM automation_daily_stats
    WHERE automation_id = p_automation_id
      AND date >= date_trunc('month', now())::DATE
      AND date < v_cutoff::DATE;

    -- סך הכל ריצות בחודש הנוכחי
    v_runs_count := v_runs_count_detailed + v_runs_count_daily;

    -- 5. החלטה על פי חוקי המערכת
    IF v_runs_count < v_runs_limit THEN
        v_allowed := true;
        v_reason := 'Within monthly limit';
    ELSE
        IF v_block_on_limit = false THEN
            v_allowed := true;
            v_reason := 'Limit exceeded, overage billing active';
        ELSE
            v_allowed := false;
            v_reason := 'Monthly run limit reached';
        END IF;
    END IF;

    -- החזרת אובייקט JSON מפורט
    RETURN jsonb_build_object(
        'allowed', v_allowed,
        'reason', v_reason,
        'runs_count', v_runs_count,
        'runs_limit', v_runs_limit,
        'runs_goal', v_runs_goal,
        'extra_allowance', v_extra_allowance,
        'block_on_limit', v_block_on_limit,
        'custom_overage_rate', v_custom_overage_rate,
        'runs_count_detailed', v_runs_count_detailed,
        'runs_count_daily', v_runs_count_daily
    );
END;
$$;
