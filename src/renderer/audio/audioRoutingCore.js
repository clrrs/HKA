/**
 * Chromium/Electron: route HTMLMediaElement output via setSinkId.
 * Attract uses two elements (headphones + speakers); other scenes use headphones only.
 */

const LS_HEADPHONE = "hka.audio.headphoneSinkId";
const LS_SPEAKER = "hka.audio.speakerSinkId";

export function loadStoredSinkIds() {
  try {
    return {
      headphone: localStorage.getItem(LS_HEADPHONE) || null,
      speaker: localStorage.getItem(LS_SPEAKER) || null,
    };
  } catch {
    return { headphone: null, speaker: null };
  }
}

export function saveStoredSinkIds(headphoneId, speakerId) {
  try {
    if (headphoneId) localStorage.setItem(LS_HEADPHONE, headphoneId);
    if (speakerId) localStorage.setItem(LS_SPEAKER, speakerId);
  } catch {
    // ignore
  }
}

/** Monitor / GPU / DP-HDMI endpoints — not built-in laptop speakers */
function labelIsDisplayOrHdmiAudio(label) {
  return (
    /Display Audio|HD Audio Driver for Display|HDMI|NVIDIA High Definition|AMD High Definition Audio|\bDP\b.*Audio/i.test(
      label
    ) || /\([^)]*Display[^)]*Audio[^)]*\)/i.test(label)
  );
}

function labelMatchesHeadphones(label) {
  if (labelIsDisplayOrHdmiAudio(label)) return false;
  return /headphone|headset|earphone|hands-free|jack|3\.5|aux/i.test(label);
}

function labelMatchesSpeakers(label) {
  if (labelMatchesHeadphones(label)) return false;
  if (labelIsDisplayOrHdmiAudio(label)) return false;
  // Do not match generic "display" / "monitor" — that catches Dell "Display Audio", not Realtek speakers
  return /\bspeakers?\b/i.test(label);
}

/**
 * Pick headphone vs speaker endpoints from enumerated outputs.
 * Stored IDs win when still present.
 */
export function pickHeadphoneAndSpeaker(outputs, stored = {}) {
  const list = outputs.filter((d) => d.kind === "audiooutput");
  if (list.length === 0) {
    return { headphoneSinkId: null, speakerSinkId: null };
  }

  const byStoredH = stored.headphone && list.find((d) => d.deviceId === stored.headphone);
  const byStoredS = stored.speaker && list.find((d) => d.deviceId === stored.speaker);

  // Drop bad stored picks (e.g. monitor Display Audio saved in older builds)
  const storedHeadphoneOk =
    byStoredH && byStoredH.label && !labelIsDisplayOrHdmiAudio(byStoredH.label);
  const storedSpeakerOk =
    byStoredS && byStoredS.label && !labelIsDisplayOrHdmiAudio(byStoredS.label);

  let headphone = storedHeadphoneOk ? byStoredH : null;
  let speaker = storedSpeakerOk ? byStoredS : null;

  const labeled = list.filter((d) => d.label);
  if (!headphone) {
    headphone =
      labeled.find((d) => /Headphones\s*\([^)]*Realtek/i.test(d.label)) ||
      labeled.find(
        (d) => /^Default - Headphones/i.test(d.label) && !labelIsDisplayOrHdmiAudio(d.label)
      ) ||
      labeled.find((d) => labelMatchesHeadphones(d.label)) ||
      null;
  }
  if (!speaker) {
    speaker =
      labeled.find((d) => /^Speakers\s*\([^)]*Realtek/i.test(d.label)) ||
      labeled.find((d) => /\bSpeakers\s*\(/i.test(d.label) && !labelIsDisplayOrHdmiAudio(d.label)) ||
      labeled.find((d) => labelMatchesSpeakers(d.label)) ||
      null;
  }

  const explicitJack = labeled.find((d) => /Headphones\s*\([^)]*Realtek/i.test(d.label));
  if (explicitJack && headphone) {
    const useExplicit =
      headphone.deviceId === "default" ||
      /^Default - Headphones/i.test(headphone.label || "");
    if (useExplicit) {
      headphone = explicitJack;
    }
  }

  if (!headphone && !speaker && list.length >= 2) {
    headphone = list[0];
    speaker = list[1];
  } else if (!headphone) {
    headphone = list.find((d) => d.deviceId !== speaker?.deviceId) || list[0];
  } else if (!speaker) {
    speaker = list.find((d) => d.deviceId !== headphone.deviceId) || list[0];
  }

  if (headphone && speaker && headphone.deviceId === speaker.deviceId) {
    speaker = list.find((d) => d.deviceId !== headphone.deviceId) || null;
  }

  let headphoneSinkId = headphone?.deviceId ?? null;
  let speakerSinkId = speaker?.deviceId ?? null;
  if (headphoneSinkId && speakerSinkId && headphoneSinkId === speakerSinkId) {
    speakerSinkId = null;
  }

  return { headphoneSinkId, speakerSinkId };
}

export async function enumerateAudioOutputs() {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return [];
  }
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((d) => d.kind === "audiooutput");
}

export async function setMediaSink(mediaEl, sinkId) {
  if (!mediaEl || !sinkId || typeof mediaEl.setSinkId !== "function") {
    return;
  }
  try {
    await mediaEl.setSinkId(sinkId);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[audio] setSinkId failed:", err);
  }
}
