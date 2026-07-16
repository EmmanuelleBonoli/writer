import { ArrowLeftRight, ArrowUpDown } from 'lucide-react-native';
import { Fragment, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Line, Path, Svg, Text as SvgText } from 'react-native-svg';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TimelineGraphViewProps, TimelineOrientation } from '@/types/timeline.types';

import { computeTimelineLayout, TIMELINE_NODE_HEIGHT, TIMELINE_NODE_WIDTH } from '../../timeline/timeline-layout';
import { SceneLinkBadge } from './SceneLinkBadge';

/**
 * Vue graphique de la timeline : une ligne (ou colonne) par arc narratif, les événements positionnés
 * chronologiquement, avec des courbes en pointillés montrant où un sous-arc rejoint un autre arc.
 * Les nœuds (cartes RN superposées au SVG) sont cliquables pour ouvrir la fiche de l'événement.
 * Un bouton permet de basculer entre disposition linéaire horizontale et verticale.
 */
export function TimelineGraphView({ events, arcs, scenes, onSelectEvent, onOpenEventScene }: TimelineGraphViewProps) {
  const theme = useTheme();
  const [orientation, setOrientation] = useState<TimelineOrientation>('horizontal');
  const isHorizontal = orientation === 'horizontal';
  const { width, height, nodes, laneGuides, arcLines, linkPaths } = computeTimelineLayout(events, arcs, orientation);

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
              {laneGuides.map((lane) => (
                <Fragment key={lane.arcId}>
                  <Line x1={lane.x1} y1={lane.y1} x2={lane.x2} y2={lane.y2} stroke={theme.border} strokeWidth={1} />
                  <SvgText x={lane.labelX} y={lane.labelY} fontSize={11} fill={theme.textSecondary}>
                    {lane.title}
                  </SvgText>
                </Fragment>
              ))}

              {arcLines.map((line) => (
                <Line key={line.id} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={line.color} strokeWidth={2} />
              ))}

              {linkPaths.map((link) => (
                <Path key={link.id} d={link.d} fill="none" stroke={link.color} strokeWidth={2} strokeDasharray="5,4" />
              ))}
            </Svg>

            {events.map((event, index) => {
              const p = nodes[index];
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
                      width: TIMELINE_NODE_WIDTH,
                      height: TIMELINE_NODE_HEIGHT,
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
                      linked={scenes.some((scene) => scene.timelineEventId === event.id)}
                      onPress={() => onOpenEventScene(event.id)}
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
