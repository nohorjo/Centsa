import fs from 'fs';
import { app } from 'electron';

fs.readFile(`${app.getPath("home")}/.centsa`, "", (error, data) => { });
