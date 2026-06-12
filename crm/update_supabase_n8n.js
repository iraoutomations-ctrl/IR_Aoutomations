import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pjjncfoaunwugmgkaqlz.supabase.co';
const supabaseAnonKey = 'sb_publishable_wVtgeu0jwRxQr3xUDjkz8g_00BL2jcb';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function update() {
    try {
        console.log('Updating automation "בוט " with workflow IDs...');
        const { data, error } = await supabase
            .from('automations')
            .update({ n8n_workflow_id: 'lyCrWBmsGlRSMJmo, bRNz7Lq79wYJ5Dvo' })
            .eq('id', '8da1d6bb-05a8-4ffc-b622-863522c1d54f')
            .select();

        if (error) throw error;
        console.log('Update successful:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error updating Supabase:', e);
    }
}

update();
