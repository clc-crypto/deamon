import { Express } from "express";
import Config from "../types/config";
import createMinedCoin from "../addMinedCoin";

function register(app: Express, config: Config) {
    let SEED: string = Math.random() + "" + Math.random() + "";
    let REWARD: number = config.reward; // one reward is 0.2 CLC
    let DIFF: string = config.startingDiff;
    let TARGET: number = config.target; // 6 minutes per reward

    let lastFound = Date.now();

    app.get("/get-challenge", async (req, res) => {
        try {
            res.json({
                seed: SEED,
                diff: DIFF,
                reward: REWARD,
                lastFound: lastFound
            });
        } catch (e: any) {
            console.log(e.message);
            res.status(502);
        }
    });
    // function createMinedCoin(LEDGER_PATH: string, val: number, holder: string, miningSignature: string, minedHash: string, seed: string, diff: string): number {
    app.get("/challenge-solved", (req, res) => {
        try {
            if (!req.query.holder) throw new Error("holder parameter required");
            if (!req.query.sign) throw new Error("sign parameter required");
            if (!req.query.hash) throw new Error("hash parameter required");
            const id = createMinedCoin(config.ledgerDirectory, REWARD, req.query.holder.toString(), req.query.sign.toString(), req.query.hash.toString(), SEED, DIFF);
            res.json({ id: id });

            console.log();
            console.log("Mined #" + id + " | " + req.query.hash + " | diff: " + DIFF + " | in: " + (Date.now() - lastFound));
            console.log("Took to long? " + (Date.now() - lastFound > TARGET));
            if (Date.now() - lastFound > TARGET) DIFF = (BigInt("0x" + DIFF) + BigInt("0x" + config.adjust)).toString(16);
            else DIFF = (BigInt("0x" + DIFF) - BigInt("0x" + config.adjust)).toString(16);
            console.log(DIFF);
            DIFF = DIFF.padStart(64, '0');

            SEED = Math.random() + "" + Math.random() + "";

            console.log("New seed " + SEED);
            console.log("New diff " + DIFF);
            console.log();
            console.log("=".repeat(process.stdout.columns))

            lastFound = Date.now();
        } catch (e: any) {
            res.status(400).json({ "error": e.message });
        }
    });
}

export default register;