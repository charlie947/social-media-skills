#!/usr/bin/env bash
# export.sh: music under the voice, loudness set for Instagram, and the H.264 file Instagram wants.
# usage: bash scripts/export.sh <reel.mp4> <music.wav|none> <out-ig.mp4> [dB the music sits under the voice, default 12]
#
# 1 the music loops to the full length of the reel, so it never fades or stops before the last frame
# 2 the music sits 12 dB under the voice (measured loudness, not a guess)
# 3 the mix gets one static gain to -14 LUFS, then a limiter that never raises the level (level=disabled)
# 4 the video is copied if it is already H.264 1080x1920 limited range, and re-encoded to that if not
# 5 it measures the result and fails outside -15 to -13 LUFS or above -1.5 dB true peak
# Use music you have the rights to. Check it stays level first: python3 scripts/music-steady.py <music.wav>
set -euo pipefail
[[ $# -ge 3 ]] || { sed -n 2,11p "$0"; exit 2; }
IN=$1; MUSIC=$2; OUT=$3; UNDER=${4:-12}
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
loud() { ffmpeg -hide_banner -nostats -i "$1" -af ebur128=peak=true -f null - 2>&1 | awk '$1=="I:"{i=$2} $1=="Peak:"{p=$2} END{print i, p}'; }
DUR=$(ffprobe -v error -select_streams v:0 -show_entries format=duration -of csv=p=0 "$IN")

ffmpeg -v error -y -i "$IN" -map 0:a:0 -ac 2 -ar 48000 "$TMP/voice.wav"
read -r IV _ <<< "$(loud "$TMP/voice.wav")"
if [[ "$MUSIC" != "none" ]]; then
  ffmpeg -v error -y -stream_loop -1 -i "$MUSIC" -t "$DUR" -ac 2 -ar 48000 "$TMP/music.wav"
  read -r IM _ <<< "$(loud "$TMP/music.wav")"
  GM=$(awk -v v="$IV" -v m="$IM" -v u="$UNDER" 'BEGIN{printf "%.2f", (v - u) - m}')
  echo "voice $IV LUFS, music $IM LUFS, music gain $GM dB (sits $UNDER dB under the voice)"
  ffmpeg -v error -y -i "$TMP/voice.wav" -i "$TMP/music.wav" -filter_complex "[1:a]volume=${GM}dB[m];[0:a][m]amix=inputs=2:normalize=0:duration=first[a]" -map "[a]" "$TMP/mix.wav"
else
  echo "voice $IV LUFS, no music"
  cp "$TMP/voice.wav" "$TMP/mix.wav"
fi
read -r IX _ <<< "$(loud "$TMP/mix.wav")"
G=$(awk -v i="$IX" 'BEGIN{printf "%.2f", -14 - i}')
ffmpeg -v error -y -i "$TMP/mix.wav" -af "volume=${G}dB,alimiter=limit=0.79:level=disabled" -ar 48000 "$TMP/final.wav"

V=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,pix_fmt,color_range -of csv=p=0 "$IN")
if [[ "$V" == "h264,1080,1920,yuv420p,tv" ]]; then VC=(-c:v copy); else
  VC=(-c:v libx264 -profile:v high -preset slow -pix_fmt yuv420p -vf "scale=1080:1920:in_range=full:out_range=limited,format=yuv420p"
      -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -b:v 14M -maxrate 16M -bufsize 24M); fi
ffmpeg -v error -y -i "$IN" -i "$TMP/final.wav" -map 0:v:0 -map 1:a "${VC[@]}" -c:a aac -b:a 128k -ar 44100 -movflags +faststart -shortest "$OUT"

read -r I TP <<< "$(loud "$OUT")"
P=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,pix_fmt,color_range -show_entries format=duration,size -of default=nw=1:nk=1 "$OUT" | paste -sd' ' -)
echo "$P · $I LUFS · true peak $TP dB"
awk -v i="$I" -v p="$TP" 'BEGIN{ok = (i >= -15 && i <= -13 && p <= -1.5); print (ok ? "PASS" : "FAIL") " loudness -15..-13 LUFS and true peak at or under -1.5 dB"; exit !ok}'
