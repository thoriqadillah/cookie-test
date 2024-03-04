export function parseFlags(argv: string[]): Record<string, string> {
    const flags: Record<string, string> = {}
    
    argv.forEach(arg => {
        if (arg.startsWith('--')) {
            const [flag, value] = arg.split('='); // Split the argument by '=' to separate flag and value
            const flagName = flag.slice(2); // Remove the leading '--' from the flag name
            
            flags[flagName] = value || './.env'; // If no value is provided, set it to true
        }
    })

    return flags
}