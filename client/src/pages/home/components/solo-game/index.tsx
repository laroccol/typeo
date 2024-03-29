import React from "react";
import StandardGame from "components/standard-game";
import { useGameSettings } from "contexts/GameSettings";
import PracticeBox from "components/standard-game/practice-box";
import Header, { HeaderMobile } from "pages/home/components/header";
import Settings from "components/standard-game/settings";
import Defender from "components/defender";
import { GameTypes } from "constants/settings";
import { Grid, useMediaQuery, useTheme } from "@mui/material";

export default function SoloGame() {
  const { gameSettings } = useGameSettings();

  const { isPractice, practiceStrings } = gameSettings.gameInfo.practice;
  const isDefenderMode = gameSettings.gameInfo.type === GameTypes.DEFENDER;

  const theme = useTheme();
  const vsScreenSize = useMediaQuery(theme.breakpoints.up("vs"));
  const mdScreenSize = useMediaQuery(theme.breakpoints.up("md"));

  const DefenderMode = gameSettings.gameInfo.type === GameTypes.DEFENDER;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={DefenderMode ? 12 : 10} alignSelf="flex-end">
        <Grid container spacing={3}>
          <Grid item display={{ xs: "none", md: "block" }} md={1.25} xl={1} />
          {mdScreenSize || DefenderMode ? (
            <Grid
              item
              xs={12}
              md={DefenderMode ? 12 : 10.75}
              xl={DefenderMode ? 12 : 11}
              alignSelf="flex-start"
            >
              {vsScreenSize ? <Header /> : <HeaderMobile />}
            </Grid>
          ) : null}
          {DefenderMode ? (
            <Defender />
          ) : (
            <StandardGame
              settings={gameSettings}
              testDisabled={isPractice && practiceStrings.length === 0}
            />
          )}
        </Grid>
      </Grid>
      <Grid item xs={12} lg={DefenderMode ? 12 : 2} alignSelf="flex-end">
        <Settings />
      </Grid>
      {isPractice ? <PracticeBox /> : null}
    </Grid>
  );
}
