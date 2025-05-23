import { Matches, Match, MatchState } from "./matchmaking";
import { Server, Socket } from "socket.io";

const PREFIX = "race:";

export const CLIENT_RACE_UPDATE_EVENT = `${PREFIX}race-update`;
export const SERVER_RACE_UPDATE_EVENT = `${PREFIX}server-race-update`;
export const RACER_FINISHED_EVENT = `${PREFIX}racer-finished`;
export const RACE_COMPLETE_EVENT = `${PREFIX}race-complete`;

interface MatchUpdate {
  id: string;
  isCorrect: boolean;
  currentCharIndex: number;
  wordsTyped: number;
  wpm: number;
}

interface RacerFinish {
  id: string;
  place: number;
  wordsTyped: number;
  wpm: number;
}

export const raceSocketHandler = (io: Server, socket: Socket) => {
  socket.on(
    CLIENT_RACE_UPDATE_EVENT,
    (currentCharIndex: number, wordsTyped: number, isCorrect: boolean) => {
      if (currentCharIndex && typeof currentCharIndex === "number") {
        if (socket.rooms.size > 1) {
          const socketRoomKeys = socket.rooms.keys();
          socketRoomKeys.next();
          const matchID: string = socketRoomKeys.next().value;

          const match: Match = Matches.get(matchID);

          if (match && match.matchState === MatchState.STARTED) {
            const wpm =
              (currentCharIndex / 5 / (Date.now() - match.startTime)) * 60000;
            const matchUpdate: MatchUpdate = {
              id: socket.data.user_id,
              isCorrect,
              currentCharIndex,
              wordsTyped: wordsTyped,
              wpm: wpm,
            };

            io.in(matchID).emit(SERVER_RACE_UPDATE_EVENT, matchUpdate);

            if (currentCharIndex === match.passage.length - 1 && isCorrect) {
              let place: number;
              if (match.finishers) {
                place = match.finishers.length + 1;
                match.finishers.push(socket.data.user_id);
              } else {
                place = 1;
                match.finishers = [socket.data.user_id];
              }

              const racerFinish: RacerFinish = {
                id: socket.data.user_id,
                place: place,
                wordsTyped: wordsTyped,
                wpm: wpm,
              };
              io.in(matchID).emit(RACER_FINISHED_EVENT, racerFinish);

              if (match.finishers.length >= match.players.length) {
                io.in(matchID).emit(RACE_COMPLETE_EVENT);
                Matches.delete(matchID);
                io.socketsLeave(matchID);
              }
            }
          }
        }
      }
    }
  );
};
