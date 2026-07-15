import { ArrowLeftRight, ArrowUpDown } from 'lucide-react-native';
import { Fragment, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Line, Path, Svg, Text as SvgText } from 'react-native-svg';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TimelineEvent, TimelineGraphViewProps, TimelineOrientation } from '@/types/timeline.types';

import { SceneLinkBadge } from './SceneLinkBadge';

const NODE_WIDTH = 130;
const NODE_HEIGHT = 56;
const MARGIN_LEFT = 12;
const MARGIN_TOP = 28;

// Espacement entre événements consécutifs (axe principal) et entre lanes d'arcs (axe transversal),
// différent selon l'orientation pour laisser assez de place aux nœuds et aux libellés.
const MAIN_SPACING = { horizontal: 140, vertical: 90 };
const CROSS_SPACING = { horizontal: 90, vertical: 160 };

/**
 * Vue graphique de la timeline : une ligne (ou colonne) par arc narratif, les événements positionnés
 * chronologiquement, avec des courbes en pointillés montrant où un sous-arc rejoint un autre arc.
 * Les nœuds (cartes RN superposées au SVG) sont cliquables pour ouvrir la fiche de l'événement.
 * Un bouton permet de basculer entre disposition linéaire horizontale et verticale.
 */
export function TimelineGraphView({ events, arcs, scenes, onSelectEvent, onOpenScene }: TimelineGraphViewProps) {
  const theme = useTheme();
  const [orientation, setOrientation] = useState<TimelineOrientation>('horizontal');
  const isHorizontal = orientation === 'horizontal';
  const laneIndex = new Map(arcs.map((arc, i) => [arc.id, i]));

  const mainSpacing = MAIN_SPACING[orientation];
  const crossSpacing = CROSS_SPACING[orientation];

  const pos = (event: TimelineEvent) => {
    const rank = events.findIndex((e) => e.id === event.id);
    const lane = laneIndex.get(event.arcId) ?? 0;
    return isHorizontal
      ? { x: MARGIN_LEFT + rank * mainSpacing, y: MARGIN_TOP + lane * crossSpacing }
      : { x: MARGIN_LEFT + lane * crossSpacing, y: MARGIN_TOP + rank * mainSpacing };
  };

  const width = isHorizontal
    ? MARGIN_LEFT * 2 + Math.max(events.length, 1) * mainSpacing
    : MARGIN_LEFT * 2 + Math.max(arcs.length, 1) * crossSpacing;
  const height = isHorizontal
    ? MARGIN_TOP + arcs.length * crossSpacing + 20
    : MARGIN_TOP + Math.max(events.length, 1) * mainSpacing + 20;

  const arcLines: { id: string; x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
  arcs.forEach((arc) => {
    const arcEvents = events.filter((event) => event.arcId === arc.id);
    for (let i = 0; i < arcEvents.length - 1; i++) {
      const from = pos(arcEvents[i]);
      const to = pos(arcEvents[i + 1]);
      arcLines.push({
        id: `${arc.id}-${i}`,
        x1: from.x + NODE_WIDTH / 2,
        y1: from.y + NODE_HEIGHT / 2,
        x2: to.x + NODE_WIDTH / 2,
        y2: to.y + NODE_HEIGHT / 2,
        color: arc.color,
      });
    }
  });

  const linkPaths: { id: string; d: string; color: string }[] = [];
  arcs.forEach((arc) => {
    if (!arc.linkedArcId) return;
    const arcEvents = events.filter((event) => event.arcId === arc.id);
    const last = arcEvents[arcEvents.length - 1];
    if (!last) return;

    const from = pos(last);
    let to: { x: number; y: number };
    if (arc.connectsToEventId) {
      const target = events.find((event) => event.id === arc.connectsToEventId);
      if (!target) return;
      to = pos(target);
    } else {
      const targetLane = laneIndex.get(arc.linkedArcId) ?? 0;
      to = isHorizontal
        ? { x: from.x, y: MARGIN_TOP + targetLane * crossSpacing }
        : { x: MARGIN_LEFT + targetLane * crossSpacing, y: from.y };
    }

    const fromX = from.x + NODE_WIDTH / 2;
    const fromY = from.y + NODE_HEIGHT / 2;
    const toX = to.x + NODE_WIDTH / 2;
    const toY = to.y + NODE_HEIGHT / 2;

    const d = isHorizontal
      ? (() => {
          const midY = (fromY + toY) / 2;
          return `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
        })()
      : (() => {
          const midX = (fromX + toX) / 2;
          return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
        })();

    linkPaths.push({ id: arc.id, d, color: arc.color });
  });

  return (
    <View style={styles.container}>
      <View style={[styles.orientationSwitch, { borderColor: theme.border }]}>
        <Pressable
          onPress={() => setOrientation('horizontal')}
          style={[styles.orientationOption, isHorizontal && { backgroundColor: theme.text }]}
        >
          <ArrowLeftRight size={14} color={isHorizontal ? theme.background : theme.text} />
        </Pressable>
        <Pressable
          onPress={() => setOrientation('vertical')}
          style={[styles.orientationOption, !isHorizontal && { backgroundColor: theme.text }]}
        >
          <ArrowUpDown size={14} color={!isHorizontal ? theme.background : theme.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.verticalScrollContent}>
        <ScrollView horizontal contentContainerStyle={styles.scrollContent}>
          <View style={{ width, height }}>
            <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
              {arcs.map((arc, i) =>
                isHorizontal ? (
                  <Fragment key={arc.id}>
                    <Line
                      x1={0}
                      y1={MARGIN_TOP + i * crossSpacing + NODE_HEIGHT / 2}
                      x2={width}
                      y2={MARGIN_TOP + i * crossSpacing + NODE_HEIGHT / 2}
                      stroke={theme.border}
                      strokeWidth={1}
                    />
                    <SvgText x={4} y={MARGIN_TOP + i * crossSpacing - 8} fontSize={11} fill={theme.textSecondary}>
                      {arc.title}
                    </SvgText>
                  </Fragment>
                ) : (
                  <Fragment key={arc.id}>
                    <Line
                      x1={MARGIN_LEFT + i * crossSpacing + NODE_WIDTH / 2}
                      y1={0}
                      x2={MARGIN_LEFT + i * crossSpacing + NODE_WIDTH / 2}
                      y2={height}
                      stroke={theme.border}
                      strokeWidth={1}
                    />
                    <SvgText x={MARGIN_LEFT + i * crossSpacing} y={16} fontSize={11} fill={theme.textSecondary}>
                      {arc.title}
                    </SvgText>
                  </Fragment>
                )
              )}

              {arcLines.map((line) => (
                <Line key={line.id} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={line.color} strokeWidth={2} />
              ))}

              {linkPaths.map((link) => (
                <Path key={link.id} d={link.d} fill="none" stroke={link.color} strokeWidth={2} strokeDasharray="5,4" />
              ))}
            </Svg>

            {events.map((event) => {
              const p = pos(event);
              const arc = arcs.find((a) => a.id === event.arcId) ?? arcs[0];
              return (
                <Pressable
                  key={event.id}
                  onPress={() => onSelectEvent(event.id)}
                  style={[
                    styles.node,
                    {
                      left: p.x,
                      top: p.y,
                      width: NODE_WIDTH,
                      height: NODE_HEIGHT,
                      backgroundColor: theme.background,
                      borderColor: arc?.color ?? theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.nodeTitle, { color: theme.text }]} numberOfLines={1}>
                    {event.title || 'Sans titre'}
                  </Text>
                  {event.description ? (
                    <Text style={[styles.nodeDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                      {event.description}
                    </Text>
                  ) : null}

                  <View style={styles.sceneLinkCorner}>
                    <SceneLinkBadge
                      linkedSceneId={scenes.find((scene) => scene.timelineEventId === event.id)?.id ?? null}
                      onOpenScene={onOpenScene}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orientationSwitch: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radii.card,
    overflow: 'hidden',
    marginBottom: Spacing.two,
  },
  orientationOption: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  verticalScrollContent: {
    flexGrow: 1,
  },
  scrollContent: {
    padding: Spacing.two,
  },
  node: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: Radii.card,
    padding: Spacing.two,
  },
  nodeTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  nodeDescription: {
    fontSize: 10,
    marginTop: 2,
    lineHeight: 13,
  },
  sceneLinkCorner: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
});
