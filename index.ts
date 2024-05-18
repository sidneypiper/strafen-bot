import Add from './commands/Add';
import Blame from './commands/Blame';
import Cash from './commands/Cash';
import List from './commands/List';
import Remove from './commands/Remove';
import Undo from './commands/Undo';
import type Command from './core/Command.ts';
import { initDiscordClient } from './core/Helpers';

const commands: Command[] = [Cash, List, Add, Remove, Blame, Undo];

initDiscordClient(commands);
