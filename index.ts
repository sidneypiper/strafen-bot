import Create from './commands/Create';
import Add from './commands/Add';
import Cash from './commands/Cash';
import List from './commands/List';
import Remove from './commands/Remove';
import Undo from './commands/Undo';
import Help from './commands/Help';
import type Command from './core/Command.ts';
import { initDiscordClient } from './core/Helpers';

const commands: Command[] = [Cash, List, Create, Remove, Add, Undo, Help];

initDiscordClient(commands).then(() => console.log('Discord client initialized.'));