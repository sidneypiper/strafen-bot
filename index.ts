import Pong from './commands/Pong.ts';
import type Command from './core/Command.ts';
import { initDiscordClient } from './core/Helpers.ts';

const commands: Command[] = [Pong];

initDiscordClient(commands);
