import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import { Typography, FontFamily } from "@/constants/Typography";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import * as Haptics from "expo-haptics";
import { Colors, ColorTheme } from "@/constants/Colors";
import { Spacing, BorderRadius, Layout } from "@/constants/Spacing";
import { MOCK_IDEAS } from "@/fixtures/ideas";
import { MOCK_RESEARCH } from "@/fixtures/research";
import { MOCK_TASKS } from "@/fixtures/tasks";

function AccordionSection({
  title,
  children,
  defaultOpen = false,
  theme,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  theme: ColorTheme;
}) {
  const styles = createStyles(theme);
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={styles.accordion}>
      <Pressable
        style={styles.accordionHeader}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setOpen(!open);
        }}
      >
        <Text style={styles.accordionTitle}>{title}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={theme.textTertiary}
        />
      </Pressable>
      {open && <View style={styles.accordionContent}>{children}</View>}
    </View>
  );
}

/**
 * Agent types the user can invoke from the AI input.
 * Phase 4: These will map to real ARQ background tasks.
 */
type AgentType = "spark" | "research" | "schedule" | "enhance";

interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: AgentType;
  timestamp: Date;
}

const AGENT_CHIPS: { type: AgentType; icon: string; label: string }[] = [
  { type: "spark", icon: "flash", label: "SPARK" },
  { type: "research", icon: "search", label: "Research" },
  { type: "schedule", icon: "calendar", label: "Schedule" },
  { type: "enhance", icon: "color-wand", label: "Enhance" },
];

/**
 * Mock AI response generator.
 * Phase 4: Replace with real LLM client call via LLMClient abstraction.
 */
function getMockAiResponse(
  query: string,
  agent: AgentType,
  ideaTitle: string,
): string {
  const responses: Record<AgentType, string[]> = {
    spark: [
      `Great question about "${ideaTitle}"! Based on the idea, I'd suggest starting with an MVP that focuses on the core value proposition. Want me to break this down further?`,
      `Here's a quick analysis: This idea has strong potential in the current market. The key differentiator would be the AI-powered automation layer. Shall I research competitors?`,
    ],
    research: [
      `I found 3 relevant competitors in this space. The market is growing ~25% YoY. The biggest gap is in user experience — most existing solutions are overly complex. Want the full breakdown?`,
      `Based on my research, the tech stack should prioritize mobile-first. React Native + FastAPI would give you the best dev velocity. I can generate a detailed tech comparison if needed.`,
    ],
    schedule: [
      `I've analyzed the tasks for "${ideaTitle}". I can break this into 5 atomic tasks (20-45 min each) and fit them into your free calendar slots this week. Ready to schedule?`,
      `Looking at your availability, I can slot in 3 tasks today and 2 tomorrow. The Calendar Tetris algorithm found optimal gaps between your existing events.`,
    ],
    enhance: [
      `Enhancement suggestion: Consider adding a social sharing feature to increase viral potential. Based on similar apps, this could boost retention by 30%. Want me to detail the implementation?`,
      `I noticed this idea could benefit from a monetization strategy. Here are 3 options: freemium with AI limits, subscription tiers, or usage-based pricing. Which interests you?`,
    ],
  };
  const pool = responses[agent];
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function IdeaDetailScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const idea = MOCK_IDEAS.find((i) => i.id === id);
  const research = id ? MOCK_RESEARCH[id] : undefined;
  const tasks = MOCK_TASKS.filter((t) => t.ideaId === id);

  // ─── AI Chat State ──────────────────────────────────────────────────
  const [aiQuery, setAiQuery] = useState("");
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentType>("spark");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isResponseExpanded, setIsResponseExpanded] = useState(false);
  const responseHeight = useRef(new Animated.Value(0)).current;
  const thinkingDots = useRef(new Animated.Value(0)).current;
  const responseScrollRef = useRef<ScrollView>(null);

  // Expand/collapse response area
  useEffect(() => {
    Animated.timing(responseHeight, {
      toValue: isResponseExpanded ? 220 : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [isResponseExpanded, responseHeight]);

  // Thinking dots animation
  useEffect(() => {
    if (isAiThinking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(thinkingDots, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(thinkingDots, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      thinkingDots.setValue(0);
    }
  }, [isAiThinking, thinkingDots]);

  const handleAiSend = () => {
    const trimmed = aiQuery.trim();
    if (trimmed.length === 0 || isAiThinking || !idea) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const userMsg: AiMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setAiMessages((prev) => [...prev, userMsg]);
    setAiQuery("");
    setIsAiThinking(true);
    setIsResponseExpanded(true);

    // Simulate AI response delay (Phase 4: real LLM call)
    setTimeout(
      () => {
        const response = getMockAiResponse(trimmed, selectedAgent, idea.title);
        const assistantMsg: AiMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          agent: selectedAgent,
          timestamp: new Date(),
        };
        setAiMessages((prev) => [...prev, assistantMsg]);
        setIsAiThinking(false);

        // Scroll to bottom after response
        setTimeout(() => {
          responseScrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
      1200 + Math.random() * 800,
    );
  };

  if (!idea) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Idea not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </Pressable>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{idea.category}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Description */}
        <Text style={styles.title}>{idea.title}</Text>
        <Text style={styles.description}>{idea.description}</Text>

        {/* Momentum */}
        <View style={styles.momentumCard}>
          <View style={styles.momentumHeader}>
            <Text style={styles.momentumLabel}>Momentum</Text>
            <Text style={styles.momentumValue}>{idea.momentum}%</Text>
          </View>
          <View style={styles.momentumBarBg}>
            <View
              style={[
                styles.momentumBarFill,
                { width: `${idea.momentum}%`, backgroundColor: theme.info },
              ]}
            />
          </View>
        </View>

        {/* Research Results */}
        {research && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="search" size={18} color={theme.info} />
              <Text style={styles.sectionTitle}>Research Results</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{research.summary}</Text>
              <View style={styles.hoursRow}>
                <Ionicons name="time" size={14} color={theme.accent} />
                <Text style={styles.hoursText}>
                  Est. {research.estimatedTotalHours} hours total
                </Text>
              </View>
            </View>

            {research.sections.map((section, i) => (
              <AccordionSection
                key={i}
                title={section.title}
                defaultOpen={i === 0}
                theme={theme}
              >
                <Text style={styles.sectionContent}>{section.content}</Text>
              </AccordionSection>
            ))}

            {/* Tech Stack */}
            <AccordionSection title="Recommended Tech Stack" theme={theme}>
              {research.techStack.map((tech, i) => (
                <View key={i} style={styles.techItem}>
                  <View style={styles.techDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.techName}>{tech.name}</Text>
                    <Text style={styles.techReason}>{tech.reason}</Text>
                  </View>
                </View>
              ))}
            </AccordionSection>

            {/* Competitors */}
            <AccordionSection title="Competitor Insights" theme={theme}>
              {research.competitorInsights.map((insight, i) => (
                <View key={i} style={styles.insightRow}>
                  <Text style={styles.insightBullet}>•</Text>
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </AccordionSection>
          </View>
        )}

        {/* Tasks */}
        {tasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list" size={18} color={theme.accent} />
              <Text style={styles.sectionTitle}>Tasks ({tasks.length})</Text>
            </View>
            {tasks.map((task) => (
              <Pressable
                key={task.id}
                style={styles.taskItem}
                onPress={() => router.push(`/task/${task.id}`)}
              >
                <Ionicons
                  name={
                    task.status === "completed"
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={20}
                  color={
                    task.status === "completed"
                      ? theme.success
                      : theme.textTertiary
                  }
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.status === "completed" && styles.taskDone,
                    ]}
                  >
                    {task.title}
                  </Text>
                  <Text style={styles.taskMeta}>
                    {task.durationMinutes} min · {task.difficulty}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.textTertiary}
                />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ─── AI Chat Section (Bottom) ──────────────────────────────── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 44 : 0}
        style={styles.aiSection}
      >
        {/* Response Area (expandable) */}
        <Animated.View
          style={[styles.responseArea, { height: responseHeight }]}
        >
          {isResponseExpanded && (
            <>
              <View style={styles.responseHeader}>
                <View style={styles.responseHeaderLeft}>
                  <Ionicons name="sparkles" size={14} color={theme.accent} />
                  <Text style={styles.responseHeaderText}>SPARK AI</Text>
                </View>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIsResponseExpanded(false);
                  }}
                  hitSlop={8}
                >
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={theme.textTertiary}
                  />
                </Pressable>
              </View>
              <ScrollView
                ref={responseScrollRef}
                style={styles.responseScroll}
                showsVerticalScrollIndicator={false}
              >
                {aiMessages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageBubble,
                      msg.role === "user"
                        ? styles.userBubble
                        : styles.assistantBubble,
                    ]}
                  >
                    {msg.role === "assistant" && msg.agent && (
                      <View style={styles.agentTag}>
                        <Ionicons
                          name={
                            (AGENT_CHIPS.find((a) => a.type === msg.agent)
                              ?.icon as any) ?? "flash"
                          }
                          size={10}
                          color={theme.accent}
                        />
                        <Text style={styles.agentTagText}>
                          {AGENT_CHIPS.find((a) => a.type === msg.agent)?.label}
                        </Text>
                      </View>
                    )}
                    <Text
                      style={[
                        styles.messageText,
                        msg.role === "user" && styles.userMessageText,
                      ]}
                    >
                      {msg.content}
                    </Text>
                  </View>
                ))}
                {isAiThinking && (
                  <View style={[styles.messageBubble, styles.assistantBubble]}>
                    <Animated.View style={{ opacity: thinkingDots }}>
                      <Text style={styles.thinkingText}>Thinking...</Text>
                    </Animated.View>
                  </View>
                )}
              </ScrollView>
            </>
          )}
        </Animated.View>

        {/* Agent Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.agentChipsContainer}
        >
          {AGENT_CHIPS.map((agent) => (
            <Pressable
              key={agent.type}
              style={[
                styles.agentChip,
                selectedAgent === agent.type && styles.agentChipActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedAgent(agent.type);
              }}
            >
              <Ionicons
                name={agent.icon as any}
                size={14}
                color={
                  selectedAgent === agent.type
                    ? theme.accent
                    : theme.textTertiary
                }
              />
              <Text
                style={[
                  styles.agentChipText,
                  selectedAgent === agent.type && styles.agentChipTextActive,
                ]}
              >
                {agent.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Pill Input */}
        <View style={styles.pillInputRow}>
          <View style={styles.pillInput}>
            <Ionicons
              name="sparkles-outline"
              size={18}
              color={theme.textTertiary}
              style={{ marginRight: Spacing.sm }}
            />
            <TextInput
              style={styles.pillTextInput}
              placeholder={`Ask ${AGENT_CHIPS.find((a) => a.type === selectedAgent)?.label} agent...`}
              placeholderTextColor={theme.placeholderText}
              value={aiQuery}
              onChangeText={setAiQuery}
              returnKeyType="send"
              onSubmitEditing={handleAiSend}
              multiline={false}
            />
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              aiQuery.trim().length === 0 && styles.sendButtonDisabled,
              pressed && aiQuery.trim().length > 0 && styles.sendButtonPressed,
            ]}
            onPress={handleAiSend}
            disabled={aiQuery.trim().length === 0 || isAiThinking}
          >
            <Ionicons
              name="arrow-up"
              size={18}
              color={
                aiQuery.trim().length > 0
                  ? theme.textInverse
                  : theme.textTertiary
              }
            />
          </Pressable>
        </View>

        {/* Quick Suggestions */}
        {aiMessages.length === 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsContainer}
          >
            {[
              { icon: "layers-outline", text: "Break it down" },
              { icon: "people-outline", text: "Find competitors" },
              { icon: "calendar-outline", text: "Schedule tasks" },
              { icon: "cash-outline", text: "Estimate cost" },
              { icon: "code-slash-outline", text: "Tech stack?" },
              { icon: "trending-up-outline", text: "How to monetize" },
            ].map((suggestion) => (
              <Pressable
                key={suggestion.text}
                style={({ pressed }) => [
                  styles.suggestionPill,
                  pressed && styles.suggestionPillPressed,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAiQuery(suggestion.text);
                }}
              >
                <Ionicons
                  name={suggestion.icon as any}
                  size={13}
                  color={theme.textSecondary}
                />
                <Text style={styles.suggestionText}>{suggestion.text}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Contextual Actions */}
        <View style={styles.contextActions}>
          {aiMessages.length > 0 && (
            <Pressable
              style={styles.contextBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAiMessages([]);
                setIsResponseExpanded(false);
              }}
            >
              <Ionicons
                name="trash-outline"
                size={14}
                color={theme.textTertiary}
              />
              <Text style={styles.contextBtnText}>Clear chat</Text>
            </Pressable>
          )}
          {aiMessages.length > 0 && !isResponseExpanded && (
            <Pressable
              style={styles.contextBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsResponseExpanded(true);
              }}
            >
              <Ionicons
                name="expand-outline"
                size={14}
                color={theme.textTertiary}
              />
              <Text style={styles.contextBtnText}>Show responses</Text>
            </Pressable>
          )}
          <View style={styles.poweredBy}>
            <Ionicons name="sparkles" size={10} color={theme.textTertiary} />
            <Text style={styles.poweredByText}>Powered by SPARK AI</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ColorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Layout.screenPaddingHorizontal,
      paddingVertical: Spacing.md,
    },
    categoryBadge: {
      backgroundColor: theme.accentDim,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
    },
    categoryText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.accent,
    },
    scrollContent: {
      paddingHorizontal: Layout.screenPaddingHorizontal,
      paddingBottom: Spacing["6xl"],
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.textPrimary,
      letterSpacing: -0.3,
      marginBottom: Spacing.md,
    },
    description: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 24,
      marginBottom: Spacing["2xl"],
    },
    errorText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 100,
    },
    momentumCard: {
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.lg,
      padding: Layout.cardPadding,
      marginBottom: Spacing["3xl"],
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    momentumHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: Spacing.sm,
    },
    momentumLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.textSecondary,
    },
    momentumValue: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.accent,
    },
    momentumBarBg: {
      height: 6,
      backgroundColor: theme.surfaceLight,
      borderRadius: 3,
      overflow: "hidden",
    },
    momentumBarFill: {
      height: "100%",
      borderRadius: 3,
    },
    section: {
      marginBottom: Spacing["3xl"],
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.textPrimary,
    },
    summaryCard: {
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.lg,
      padding: Layout.cardPadding,
      marginBottom: Spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    summaryText: {
      fontSize: 15,
      color: theme.textSecondary,
      lineHeight: 22,
    },
    hoursRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
      marginTop: Spacing.md,
      paddingTop: Spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
    },
    hoursText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.accent,
    },
    accordion: {
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
      overflow: "hidden",
    },
    accordionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: Layout.cardPadding,
    },
    accordionTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.textPrimary,
    },
    accordionContent: {
      paddingHorizontal: Layout.cardPadding,
      paddingBottom: Layout.cardPadding,
    },
    sectionContent: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 21,
    },
    techItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: Spacing.md,
      marginBottom: Spacing.md,
    },
    techDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.accent,
      marginTop: 7,
    },
    techName: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.textPrimary,
    },
    techReason: {
      fontSize: 13,
      color: theme.textTertiary,
      marginTop: 2,
    },
    insightRow: {
      flexDirection: "row",
      gap: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    insightBullet: {
      fontSize: 14,
      color: theme.accent,
      fontWeight: "700",
    },
    insightText: {
      flex: 1,
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    taskItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    taskTitle: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.textPrimary,
    },
    taskDone: {
      textDecorationLine: "line-through",
      color: theme.textTertiary,
    },
    taskMeta: {
      fontSize: 12,
      color: theme.textTertiary,
      marginTop: 2,
    },
    // ─── AI Chat Section ────────────────────────────────────────────
    aiSection: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
      backgroundColor: theme.background,
      paddingBottom: Spacing["3xl"],
    },
    responseArea: {
      overflow: "hidden",
      backgroundColor: theme.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    responseHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm,
    },
    responseHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
    },
    responseHeaderText: {
      ...Typography.labelSmall,
      color: theme.accent,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    responseScroll: {
      flex: 1,
      paddingHorizontal: Spacing.lg,
    },
    messageBubble: {
      maxWidth: "85%",
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    userBubble: {
      backgroundColor: theme.accent,
      alignSelf: "flex-end",
      borderBottomRightRadius: 4,
    },
    assistantBubble: {
      backgroundColor: theme.surfaceLight,
      alignSelf: "flex-start",
      borderBottomLeftRadius: 4,
    },
    messageText: {
      ...Typography.bodySmall,
      color: theme.textPrimary,
      lineHeight: 20,
    },
    userMessageText: {
      color: theme.textInverse,
    },
    agentTag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      marginBottom: 4,
    },
    agentTagText: {
      fontSize: 10,
      fontWeight: "600",
      color: theme.accent,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    thinkingText: {
      ...Typography.bodySmall,
      color: theme.textTertiary,
      fontStyle: "italic",
    },
    agentChipsContainer: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      gap: Spacing.sm,
    },
    agentChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
      backgroundColor: theme.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    agentChipActive: {
      backgroundColor: theme.accentDim,
      borderColor: theme.accent,
    },
    agentChipText: {
      fontSize: 12,
      fontWeight: "500",
      color: theme.textTertiary,
    },
    agentChipTextActive: {
      color: theme.accent,
      fontWeight: "600",
    },
    pillInputRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
      gap: Spacing.sm,
    },
    pillInput: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
      minHeight: 44,
    },
    pillTextInput: {
      flex: 1,
      ...Typography.bodyMedium,
      color: theme.textPrimary,
      paddingVertical: Spacing.sm,
    },
    sendButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.accent,
      justifyContent: "center",
      alignItems: "center",
    },
    sendButtonDisabled: {
      backgroundColor: theme.surfaceLight,
    },
    sendButtonPressed: {
      transform: [{ scale: 0.92 }],
      opacity: 0.9,
    },
    suggestionsContainer: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.sm,
      gap: Spacing.sm,
    },
    suggestionPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderRadius: BorderRadius.full,
      backgroundColor: theme.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    suggestionPillPressed: {
      backgroundColor: theme.accentDim,
      borderColor: theme.accent,
    },
    suggestionText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    contextActions: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm,
      gap: Spacing.lg,
    },
    contextBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    contextBtnText: {
      fontSize: 11,
      color: theme.textTertiary,
    },
    poweredBy: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      marginLeft: "auto",
    },
    poweredByText: {
      fontSize: 10,
      color: theme.textTertiary,
      letterSpacing: 0.3,
    },
  });
