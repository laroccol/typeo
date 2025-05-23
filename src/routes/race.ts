import express from "express";
import { CharacterData } from "../constants/race";
import { ResultsData } from "../constants/race";
import { Passages, CommonWords } from "../constants/passages";
import { TextTypes, GameTypes, RaceTypes } from "../constants/settings";
import { db } from "../config/firestore";
import { doc } from "prettier";
import { saveImprovementRaceStats, saveRaceStats } from "../db/race";
import { verifyIDToken } from "../auth/authenticateToken";
import {
  all_time_leaderboard,
  checkLeaderboard,
  daily_leaderboard,
} from "./leaderboard";
const router = express.Router();

/* GET users listing. */
router.get("/", (req, res) => {
  res.send("respond with a resource");
});

router.get("/passage", (req, res) => {
  const passageType = req.query.type;
  let newPassage = "";

  if (passageType === `${TextTypes.PASSAGE}`) {
    const nextPassageIndex = Math.floor(Math.random() * Passages.length);
    newPassage = Passages[nextPassageIndex];
  } else if (passageType === `${TextTypes.TOP_WORDS}`) {
    const arr = [];
    const availableWords = [...CommonWords];
    let prevWord = "";
    for (let i = 0; i < 70; i++) {
      const randIndex = Math.floor(Math.random() * availableWords.length);
      const word = availableWords[randIndex];
      arr.push(word);
      availableWords.splice(randIndex, 1);
      if (i !== 0) availableWords.push(prevWord);
      prevWord = word;
    }
    newPassage = arr.join(" ");
  } else {
    res.status(400).send({ error: "Invalid passage type" });
    return;
  }

  res.send({ passage: newPassage });
});

router.post("/statreport", verifyIDToken, async (req: any, res, next) => {
  const { uid, displayName } = req["current-user"];

  const resultsData: ResultsData = req.body.resultsData;
  const characterDataPoints: Array<CharacterData> =
    resultsData.characterDataPoints;
  const wpm = resultsData.dataPoints[resultsData.dataPoints.length - 1].wpm;
  const accuracy = resultsData.accuracy;
  const testType = resultsData.testType;
  const improvementCategory = resultsData.improvementCategory;

  const passage = resultsData.passage;

  try {
    if (resultsData.raceType === RaceTypes.IMPROVEMENT) {
      saveImprovementRaceStats(uid, {
        passage,
        wpm,
        accuracy,
        characterDataPoints,
        testType,
        improvementCategory,
      });

      return res.status(200).send("Stats Successfully Saved");
    }

    if (testType.name === "Timed" && testType.amount === 30) {
      checkLeaderboard(daily_leaderboard, "daily_leaderboard", {
        id: uid,
        name: displayName,
        accuracy,
        wpm,
      });
      checkLeaderboard(all_time_leaderboard, "all_time_leaderboard", {
        id: uid,
        name: displayName,
        accuracy,
        wpm,
      });
    }

    await saveRaceStats(uid, {
      passage,
      wpm,
      accuracy,
      characterDataPoints,
      testType,
    });
  } catch (err) {
    const error: R_ERROR = {
      status: 500,
      text: "Database Error",
    };
    next(error);
  }

  res.status(200).send("Stats Successfully Saved");
});

export default router;
