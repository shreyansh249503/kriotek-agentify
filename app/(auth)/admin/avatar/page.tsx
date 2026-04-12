"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ImageSquareIcon,
  SpeakerHighIcon,
  VideoIcon,
  CheckCircleIcon,
  CircleNotchIcon,
  ArrowRightIcon,
  FloppyDiskIcon,
  ImagesIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { generateImage, generateSpeech, generateLipsync } from "@/services/avatar.api";
import { getSavedAvatars, saveAvatar, deleteSavedAvatar } from "@/services/avatar.api";
import type { SavedAvatar } from "@/services/avatar.api";
import {
  PageContainer,
  Stepper,
  StepItem,
  StepCircle,
  StepLabel,
  StepConnector,
  StepCard,
  StepCardHeader,
  StepTitle,
  StepBadge,
  Label,
  Textarea,
  HelperText,
  ActionButton,
  ResultRow,
  AvatarPreview,
  AudioPlayer,
  VideoPlayer,
  SuccessBadge,
  ErrorBanner,
  FieldGroup,
  GenderToggle,
  GenderButton,
  VoiceGrid,
  VoiceCard,
  VoiceName,
  VoiceAccent,
  SavedSection,
  SavedSectionHeader,
  SavedSectionTitle,
  SavedGrid,
  SavedAvatarCard,
  SavedAvatarThumb,
  SavedAvatarMeta,
  SavedAvatarName,
  SavedAvatarDate,
  SavedAvatarActions,
  SmallButton,
  SaveButton,
} from "./styled";

const VOICES = {
  female: [
    { id: "af_heart", name: "Heart", accent: "American" },
    { id: "af_sky",   name: "Sky",   accent: "American" },
    { id: "bf_emma",  name: "Emma",  accent: "British"  },
  ],
  male: [
    { id: "am_adam",    name: "Adam",    accent: "American" },
    { id: "am_michael", name: "Michael", accent: "American" },
    { id: "bm_george",  name: "George",  accent: "British"  },
  ],
} as const;

type StepState = "idle" | "active" | "done";

interface StepStatus {
  avatar: StepState;
  voice: StepState;
  video: StepState;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function AvatarStudioPage() {
  // ── Step state ─────────────────────────────────────────────────────────────
  const [steps, setSteps] = useState<StepStatus>({
    avatar: "active",
    voice: "idle",
    video: "idle",
  });

  // ── Step 1: Avatar ─────────────────────────────────────────────────────────
  const [avatarPrompt, setAvatarPrompt] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);

  // ── Step 2: Voice ──────────────────────────────────────────────────────────
  const [voiceText, setVoiceText] = useState("");
  const [voiceGender, setVoiceGender] = useState<"female" | "male">("female");
  const [selectedVoice, setSelectedVoice] = useState("af_heart");
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceAudio, setVoiceAudio] = useState<string | null>(null);

  // ── Step 3: Video ──────────────────────────────────────────────────────────
  const [lipsyncPrompt, setLipsyncPrompt] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<string | null>(null);

  // ── Saved avatars ──────────────────────────────────────────────────────────
  const [savedAvatars, setSavedAvatars] = useState<SavedAvatar[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null); // id of currently-loaded saved avatar

  const loadSaved = useCallback(async () => {
    try {
      const data = await getSavedAvatars();
      setSavedAvatars(data);
    } catch {
      // silently ignore — gallery is non-critical
    }
  }, []);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function setStep(key: keyof StepStatus, state: StepState) {
    setSteps((prev) => ({ ...prev, [key]: state }));
  }

  function stepState(key: keyof StepStatus): StepState {
    return steps[key];
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  async function handleGenerateAvatar() {
    if (!avatarPrompt.trim()) return;
    setAvatarLoading(true);
    setAvatarError(null);
    setSavedId(null);
    try {
      const result = await generateImage(avatarPrompt, { width: 512, height: 512 });
      setAvatarImage(result.image);
      setStep("avatar", "done");
      setStep("voice", "active");
      if (!lipsyncPrompt) setLipsyncPrompt(avatarPrompt);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setAvatarLoading(false);
    }
  }

  async function handleGenerateVoice() {
    if (!voiceText.trim()) return;
    setVoiceLoading(true);
    setVoiceError(null);
    try {
      const result = await generateSpeech(voiceText, { voice: selectedVoice });
      setVoiceAudio(result.audio);
      setStep("voice", "done");
      setStep("video", "active");
    } catch (err) {
      setVoiceError(err instanceof Error ? err.message : "Speech generation failed");
    } finally {
      setVoiceLoading(false);
    }
  }

  async function handleGenerateVideo() {
    if (!avatarImage || !voiceAudio || !lipsyncPrompt.trim()) return;
    setVideoLoading(true);
    setVideoError(null);
    try {
      const result = await generateLipsync(avatarImage, voiceAudio, lipsyncPrompt, {
        seconds: 5,
        width: 448,
        height: 256,
      });
      setVideoResult(result.video);
      setStep("video", "done");
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : "Video generation failed");
    } finally {
      setVideoLoading(false);
    }
  }

  async function handleSaveAvatar() {
    if (!avatarImage) return;
    setSaveLoading(true);
    try {
      const name = avatarPrompt.trim().slice(0, 40) || "Avatar";
      const result = await saveAvatar(name, avatarPrompt, avatarImage);
      setSavedId(result.id);
      setSavedAvatars((prev) => [result, ...prev]);
    } catch {
      // no-op
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleDeleteSaved(id: string) {
    try {
      await deleteSavedAvatar(id);
      setSavedAvatars((prev) => prev.filter((a) => a.id !== id));
      if (savedId === id) setSavedId(null);
    } catch {
      // no-op
    }
  }

  function handleUseSaved(avatar: SavedAvatar) {
    setAvatarImage(avatar.image_data);
    setAvatarPrompt(avatar.avatar_prompt ?? "");
    setLipsyncPrompt(avatar.avatar_prompt ?? "");
    setSavedId(avatar.id);
    setStep("avatar", "done");
    setStep("voice", "active");
    setStep("video", "idle");
    setVoiceAudio(null);
    setVideoResult(null);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageContainer>
      {/* Stepper */}
      <Stepper>
        <StepItem $state={stepState("avatar")}>
          <StepCircle $state={stepState("avatar")}>
            {stepState("avatar") === "done" ? <CheckCircleIcon size={18} weight="fill" /> : "1"}
          </StepCircle>
          <StepLabel $state={stepState("avatar")}>
            <span>Step 1</span>
            <span>Create Avatar</span>
          </StepLabel>
        </StepItem>

        <StepConnector $done={stepState("avatar") === "done"} />

        <StepItem $state={stepState("voice")}>
          <StepCircle $state={stepState("voice")}>
            {stepState("voice") === "done" ? <CheckCircleIcon size={18} weight="fill" /> : "2"}
          </StepCircle>
          <StepLabel $state={stepState("voice")}>
            <span>Step 2</span>
            <span>Generate Voice</span>
          </StepLabel>
        </StepItem>

        <StepConnector $done={stepState("voice") === "done"} />

        <StepItem $state={stepState("video")}>
          <StepCircle $state={stepState("video")}>
            {stepState("video") === "done" ? <CheckCircleIcon size={18} weight="fill" /> : "3"}
          </StepCircle>
          <StepLabel $state={stepState("video")}>
            <span>Step 3</span>
            <span>Generate Video</span>
          </StepLabel>
        </StepItem>
      </Stepper>

      {/* ── Saved Avatars Gallery ──────────────────────────────────────────── */}
      {savedAvatars.length > 0 && (
        <SavedSection>
          <SavedSectionHeader>
            <SavedSectionTitle>
              <ImagesIcon size={18} weight="duotone" />
              Saved Avatars
            </SavedSectionTitle>
          </SavedSectionHeader>
          <SavedGrid>
            {savedAvatars.map((avatar) => (
              <SavedAvatarCard key={avatar.id} $selected={savedId === avatar.id}>
                <SavedAvatarThumb src={avatar.image_data} alt={avatar.name} />
                <SavedAvatarMeta>
                  <SavedAvatarName>{avatar.name}</SavedAvatarName>
                  <SavedAvatarDate>{formatDate(avatar.created_at)}</SavedAvatarDate>
                </SavedAvatarMeta>
                <SavedAvatarActions>
                  <SmallButton onClick={() => handleUseSaved(avatar)}>Use</SmallButton>
                  <SmallButton $danger onClick={() => handleDeleteSaved(avatar.id)}>
                    <TrashIcon size={11} />
                  </SmallButton>
                </SavedAvatarActions>
              </SavedAvatarCard>
            ))}
          </SavedGrid>
        </SavedSection>
      )}

      {/* ── Step 1: Avatar ─────────────────────────────────────────────────── */}
      <StepCard $active={stepState("avatar") !== "idle"}>
        <StepCardHeader>
          <StepTitle>
            <ImageSquareIcon size={20} weight="duotone" />
            Create Avatar
          </StepTitle>
          {stepState("avatar") === "done" && (
            <SuccessBadge>
              <CheckCircleIcon size={14} weight="fill" />
              Done
            </SuccessBadge>
          )}
          {stepState("avatar") === "active" && <StepBadge>Current step</StepBadge>}
        </StepCardHeader>

        <FieldGroup>
          <Label>Avatar Prompt</Label>
          <Textarea
            value={avatarPrompt}
            onChange={(e) => setAvatarPrompt(e.target.value)}
            placeholder="A professional woman in her 30s, neutral expression, soft studio lighting, looking directly at camera, photorealistic..."
            rows={3}
          />
          <HelperText>Describe the person's appearance, expression, lighting and camera angle.</HelperText>
        </FieldGroup>

        {avatarError && <ErrorBanner>{avatarError}</ErrorBanner>}

        {avatarImage && (
          <ResultRow>
            <AvatarPreview src={avatarImage} alt="Generated avatar" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Avatar generated successfully.</span>
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                You can regenerate with a different prompt, or proceed to Step 2.
              </span>
              <SaveButton
                onClick={handleSaveAvatar}
                disabled={saveLoading || savedId !== null}
                $saved={savedId !== null}
              >
                {saveLoading ? (
                  <><CircleNotchIcon size={13} className="spin" /> Saving…</>
                ) : savedId !== null ? (
                  <><CheckCircleIcon size={13} weight="fill" /> Saved</>
                ) : (
                  <><FloppyDiskIcon size={13} /> Save Avatar</>
                )}
              </SaveButton>
            </div>
          </ResultRow>
        )}

        <ActionButton
          onClick={handleGenerateAvatar}
          disabled={!avatarPrompt.trim() || avatarLoading}
          $loading={avatarLoading}
        >
          {avatarLoading ? (
            <>
              <CircleNotchIcon size={16} className="spin" />
              Generating…
            </>
          ) : avatarImage ? (
            "Regenerate Avatar"
          ) : (
            <>
              Generate Avatar
              <ArrowRightIcon size={16} />
            </>
          )}
        </ActionButton>
      </StepCard>

      {/* ── Step 2: Voice ──────────────────────────────────────────────────── */}
      <StepCard $active={stepState("voice") !== "idle"}>
        <StepCardHeader>
          <StepTitle>
            <SpeakerHighIcon size={20} weight="duotone" />
            Generate Voice
          </StepTitle>
          {stepState("voice") === "done" && (
            <SuccessBadge>
              <CheckCircleIcon size={14} weight="fill" />
              Done
            </SuccessBadge>
          )}
          {stepState("voice") === "active" && <StepBadge>Current step</StepBadge>}
        </StepCardHeader>

        <FieldGroup>
          <Label>Voice Gender</Label>
          <GenderToggle>
            <GenderButton
              $active={voiceGender === "female"}
              onClick={() => { setVoiceGender("female"); setSelectedVoice("af_heart"); }}
            >
              Female
            </GenderButton>
            <GenderButton
              $active={voiceGender === "male"}
              onClick={() => { setVoiceGender("male"); setSelectedVoice("am_adam"); }}
            >
              Male
            </GenderButton>
          </GenderToggle>
        </FieldGroup>

        <FieldGroup>
          <Label>Select Voice</Label>
          <VoiceGrid>
            {VOICES[voiceGender].map((v) => (
              <VoiceCard
                key={v.id}
                $active={selectedVoice === v.id}
                onClick={() => setSelectedVoice(v.id)}
              >
                <VoiceName>{v.name}</VoiceName>
                <VoiceAccent>{v.accent}</VoiceAccent>
              </VoiceCard>
            ))}
          </VoiceGrid>
        </FieldGroup>

        <FieldGroup>
          <Label>Script</Label>
          <Textarea
            value={voiceText}
            onChange={(e) => setVoiceText(e.target.value)}
            placeholder="Welcome to Agentify! I'm your AI-powered assistant, here to help you 24/7..."
            rows={3}
          />
          <HelperText>This text will be spoken by the avatar in the final video.</HelperText>
        </FieldGroup>

        {voiceError && <ErrorBanner>{voiceError}</ErrorBanner>}

        {voiceAudio && (
          <FieldGroup>
            <Label>Preview</Label>
            <AudioPlayer controls src={voiceAudio} />
          </FieldGroup>
        )}

        <ActionButton
          onClick={handleGenerateVoice}
          disabled={!voiceText.trim() || voiceLoading}
          $loading={voiceLoading}
        >
          {voiceLoading ? (
            <>
              <CircleNotchIcon size={16} className="spin" />
              Generating…
            </>
          ) : voiceAudio ? (
            "Regenerate Voice"
          ) : (
            <>
              Generate Voice
              <ArrowRightIcon size={16} />
            </>
          )}
        </ActionButton>
      </StepCard>

      {/* ── Step 3: Video ──────────────────────────────────────────────────── */}
      <StepCard $active={stepState("video") !== "idle"}>
        <StepCardHeader>
          <StepTitle>
            <VideoIcon size={20} weight="duotone" />
            Generate Video
          </StepTitle>
          {stepState("video") === "done" && (
            <SuccessBadge>
              <CheckCircleIcon size={14} weight="fill" />
              Done
            </SuccessBadge>
          )}
          {stepState("video") === "active" && <StepBadge>Current step</StepBadge>}
        </StepCardHeader>

        <FieldGroup>
          <Label>Scene Prompt</Label>
          <Textarea
            value={lipsyncPrompt}
            onChange={(e) => setLipsyncPrompt(e.target.value)}
            placeholder="A professional woman in her 30s, neutral expression, soft studio lighting, looking directly at camera. Static shot, no background movement..."
            rows={4}
          />
          <HelperText>
            Describe the scene in detail (150–200 words). Keep camera static, character stationary.
            Dialogue is driven by the voice generated in Step 2.
          </HelperText>
        </FieldGroup>

        {videoError && <ErrorBanner>{videoError}</ErrorBanner>}

        {videoResult && (
          <FieldGroup>
            <Label>Result</Label>
            <VideoPlayer controls src={videoResult} />
          </FieldGroup>
        )}

        <ActionButton
          onClick={handleGenerateVideo}
          disabled={!avatarImage || !voiceAudio || !lipsyncPrompt.trim() || videoLoading}
          $loading={videoLoading}
        >
          {videoLoading ? (
            <>
              <CircleNotchIcon size={16} className="spin" />
              Generating video…
            </>
          ) : videoResult ? (
            "Regenerate Video"
          ) : (
            <>
              Generate Video
              <ArrowRightIcon size={16} />
            </>
          )}
        </ActionButton>
      </StepCard>
    </PageContainer>
  );
}
