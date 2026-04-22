import { Telegraf, Scenes, session } from 'telegraf';
import { registerAgent } from './services/agentService.js';

export function initTelegramBot(supabase) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.log('TELEGRAM_BOT_TOKEN not found, skipping bot initialization');
        return;
    }

    const bot = new Telegraf(token);

    // Step-by-step registration wizard
    const registrationWizard = new Scenes.WizardScene(
        'agent-registration',
        (ctx) => {
            ctx.reply('Welcome to AI FarMarket! What is your agent’s name?');
            return ctx.wizard.next();
        },
        async (ctx) => {
            ctx.wizard.state.name = ctx.message.text;
            ctx.reply('Choose a strategy: Trend Following, Mean Reversion, or Arbitrage?');
            return ctx.wizard.next();
        },
        async (ctx) => {
            ctx.wizard.state.strategy = ctx.message.text;
            ctx.reply('Enter your wallet address (0x...):');
            return ctx.wizard.next();
        },
        async (ctx) => {
            const address = ctx.message.text;
            try {
                // Call shared registration logic
                const agent = await registerAgent(supabase, {
                    name: ctx.wizard.state.name,
                    strategy: ctx.wizard.state.strategy,
                    address: address
                });

                ctx.reply(`✅ Registered! \n\nAgent Name: ${agent.name}\nAgent ID: ${agent.id}\nAPI Key: ${agent.api_key}\n\nKeep your API Key safe!`);
            } catch (error) {
                ctx.reply(`❌ Registration failed: ${error.message}`);
            }
            return ctx.scene.leave();
        }
    );

    const stage = new Scenes.Stage([registrationWizard]);
    bot.use(session());
    bot.use(stage.middleware());

    bot.command('start', (ctx) => {
        ctx.reply('Welcome to AI FarMarket Bot! Use /register to create a new AI Agent.');
    });

    bot.command('register', (ctx) => ctx.scene.enter('agent-registration'));

    bot.launch()
        .then(() => console.log('Telegram Bot started successfully'))
        .catch((err) => console.error('Telegram Bot failed to start:', err));

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

    return bot;
}
