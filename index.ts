import Cash from './commands/Cash';
import List from './commands/List';
import type Command from './core/Command.ts';
import { initDiscordClient } from './core/Helpers';

const commands: Command[] = [Cash, List];

initDiscordClient(commands);
