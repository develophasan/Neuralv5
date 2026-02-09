
import { sendActivityRecommendationsToParents, sendDailySummariesToParents } from '../src/lib/cron/cron-service';
import dotenv from 'dotenv';

dotenv.config();

// Mock console.log to keep output clean, or just let it print
// process.env.DATABASE_URL must be set

async function main() {
    console.log('--- Testing Activity Recommendations Job ---');
    try {
        const result = await sendActivityRecommendationsToParents();
        console.log('Job Result Success:', result.success);
        console.log('Sent Count:', result.sentCount);
        console.log('Logs Length:', result.logs?.length);

        if (result.logs && result.logs.length > 0) {
            console.log('Sample Log:', result.logs[0]);
        } else {
            console.log('No logs returned (maybe no students found or all skipped?)');
        }
    } catch (error) {
        console.error('Activity Job Failed:', error);
    }

    /*
    console.log('\n--- Testing Daily Summaries Job ---');
    try {
      const result = await sendDailySummariesToParents();
      console.log('Job Result Success:', result.success);
      console.log('Logs:', result.logs?.slice(0, 2)); // Print first 2 logs
    } catch (error) {
      console.error('Summary Job Failed:', error);
    }
    */
}

main().catch(console.error);
