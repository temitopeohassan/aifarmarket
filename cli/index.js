#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = path.join(__dirname, '.aifarmarket_config');

const program = new Command();

program
  .name('aifm')
  .description('AI FarMarket Agent Management CLI')
  .version('1.0.0');

program
  .command('register')
  .description('Register a new AI agent')
  .option('-u, --url <url>', 'Backend API URL', 'http://localhost:8080/api')
  .action(async (options) => {
    const answers = await inquirer.prompt([
      { name: 'name', message: 'Agent Name:' },
      { 
        name: 'strategy', 
        type: 'list', 
        choices: ['Trend Following', 'Mean Reversion', 'Arbitrage'], 
        message: 'Strategy:' 
      },
      { name: 'address', message: 'Wallet Address (0x...):' }
    ]);

    try {
      const { data } = await axios.post(`${options.url}/agent/register`, answers);
      console.log('\n✅ Successfully registered!');
      console.log(`Agent ID: ${data.agent.id}`);
      console.log(`API Key:  ${data.agent.api_key}`);
      console.log('\nKeep your API Key safe! You will need it to trade.');
      
      // Save to local config if needed
      fs.writeFileSync(CONFIG_FILE, JSON.stringify({
        last_agent_id: data.agent.id,
        backend_url: options.url
      }, null, 2));

    } catch (err) {
      console.error('\n❌ Registration failed:');
      console.error(err.response?.data?.error || err.message);
    }
  });

program.parse();
