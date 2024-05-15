import Cash from './commands/Cash';
import type Command from './core/Command.ts';
import { initDiscordClient } from './core/Helpers';

const commands: Command[] = [Cash];

initDiscordClient(commands);
