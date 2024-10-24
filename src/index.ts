export interface TerminalDimensions {
    x: number,
    y: number
}

export const colors = {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    brightBlack: '\x1b[90m',
    brightRed: '\x1b[91m',
    brightGreen: '\x1b[92m',
    brightYellow: '\x1b[93m',
    brightBlue: '\x1b[94m',
    brightMagenta: '\x1b[95m',
    brightCyan: '\x1b[96m',
    brightWhite: '\x1b[97m',
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
    bgBrightBlack: '\x1b[100m',
    bgBrightRed: '\x1b[101m',
    bgBrightGreen: '\x1b[102m',
    bgBrightYellow: '\x1b[103m',
    bgBrightBlue: '\x1b[104m',
    bgBrightMagenta: '\x1b[105m',
    bgBrightCyan: '\x1b[106m',
    bgBrightWhite: '\x1b[107m'
};

export const styles = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    italic: '\x1b[3m',
    underline: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    strikethrough: '\x1b[9m'
};

export class HandleOutput {
    // public createBoxWatch(c: string) { // https://nodejs.org/api/tty.html#event-resize
    //     process.stdout.on('resize', () => {
    //         this.createBox(c)
    //     });
    // }

    public getTerminalDimensions(): TerminalDimensions {
        return { x: process.stdout.columns, y: process.stdout.rows }
    }

    public replaceColorPrefix(c: string): string {
        // Red
        c = c.replace('\\$r', colors.red)
        // Green
        c = c.replace('\\$g', colors.green)
        // Blue
        c = c.replace('\\$b', colors.blue)
        // Italic
        c = c.replace('\\$_', styles.italic)
        // Reset
        c= c.replace('\\$-', styles.reset)
        return c
    }

    public splitStringByLength(c: string, length: number, options: { fillRemaining?: boolean | false, fillChar?: string | ' ', trimElements?: boolean | false, keepWords?: boolean | false }) {
        if (options.keepWords) {
            const words = c.split(/\s+/);
            const chunks = [];
            let currentChunk: string[] = [];
            let currentLength = 0;

            words.forEach(word => {
                if (currentLength + word.length + (currentLength > 0 ? 1 : 0) <= length) {
                    if (currentLength > 0) {
                        currentChunk.push(' ');
                        currentLength += 1;
                    }
                    currentChunk.push(word);
                    currentLength += word.length;
                } else {
                    if (currentChunk.length > 0) {
                        chunks.push(currentChunk.join(''));
                    }
                    currentChunk = [word];
                    currentLength = word.length;
                }
            });

            if (currentChunk.length > 0) {
                chunks.push(currentChunk.join(''));
            }

            return chunks.map(chunk => {
                if (options.trimElements) chunk = chunk.trim();
                if (options.fillRemaining) chunk = chunk.padEnd(length, options.fillChar);
                return chunk;
            });
        }

        let chunks = Array.from({ length: Math.ceil(c.length / length) }, (_, i) =>
            c.slice(i * length, (i + 1) * length)
        );

        return chunks.map(chunk => {
            if (options.trimElements) chunk = chunk.trim();
            if (options.fillRemaining) chunk = chunk.padEnd(length, options.fillChar);
            return chunk;
        });
    }

    public createBox(c: string) {
        const d: TerminalDimensions = this.getTerminalDimensions()

        const lines = this.splitStringByLength(this.replaceColorPrefix(c), d.x - 2, { fillRemaining: true, keepWords: true })

        process.stdout.write('┌' + "─".repeat(d.x - 2) + '┐\n')
        lines.forEach((e) => {
            process.stdout.write(('│' + e + '│\n'))
        })
        process.stdout.write('└' + "─".repeat(d.x - 2) + '┘\n')
    }
}
