import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Check, Save, Upload } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { showToast } from '@/components/toast/toast-store';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ExportableSectionId, ExportFormat, ExportSectionProps } from '@/types/export.types';

import { BOOK_SECTIONS } from '../../book-sections';
import { buildExportDocx, type TimelineImageData } from '../../export/build-export-docx';
import { buildExportHtml } from '../../export/build-export-html';
import { buildTimelineSvgMarkup } from '../../export/build-timeline-svg';
import { captureTimelineImage } from '../../export/timeline-capture';
import { TimelineCaptureLayer } from '../../export/TimelineCaptureLayer';
import { computeTimelineLayout } from '../../timeline/timeline-layout';

const ACCENT_COLOR = '#7C5CFC';
const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const EXPORTABLE_SECTIONS = BOOK_SECTIONS.filter(
  (section): section is typeof section & { id: ExportableSectionId } => section.id !== 'export',
);

function sanitizeFileName(title: string): string {
  const cleaned = title.trim().replace(/[^a-zA-Z0-9\-_ ]/g, '').replace(/\s+/g, '-');
  return cleaned || 'manuscrit';
}

/** Ouvre le HTML dans une nouvelle fenêtre et déclenche l'impression navigateur (l'utilisateur choisit "Enregistrer en PDF") : `expo-print` ne produit pas de fichier réel sur web. */
function printHtmlOnWeb(html: string): void {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  const printWindow = window.open(url, '_blank');
  if (!printWindow) {
    URL.revokeObjectURL(url);
    return;
  }
  printWindow.addEventListener('load', () => {
    printWindow.print();
    URL.revokeObjectURL(url);
  });
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

/** Déclenche un téléchargement direct dans le navigateur : `expo-sharing` n'a pas de feuille de partage utilisable sur web desktop. */
function downloadBlobOnWeb(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Export du manuscrit en PDF ou Word, avec choix des sections à inclure. */
export function ExportSection({ book }: ExportSectionProps) {
  const theme = useTheme();
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [selectedSections, setSelectedSections] = useState<Set<ExportableSectionId>>(
    () => new Set(EXPORTABLE_SECTIONS.map((section) => section.id)),
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const timelineCaptureRef = useRef<View>(null);

  const timelineLayout = computeTimelineLayout(book.timeline, book.arcs, 'vertical');
  const timelineSvgMarkup = book.timeline.length > 0 ? buildTimelineSvgMarkup(book.timeline, book.arcs) : null;

  const toggleSection = (id: ExportableSectionId) => {
    setSelectedSections((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedSections((current) =>
      current.size === EXPORTABLE_SECTIONS.length ? new Set() : new Set(EXPORTABLE_SECTIONS.map((section) => section.id)),
    );
  };

  const handleExport = async () => {
    if (selectedSections.size === 0) {
      showToast('Aucune section sélectionnée : choisissez au moins une section à exporter.');
      return;
    }

    setIsExporting(true);
    try {
      const sections = Array.from(selectedSections);
      const fileName = sanitizeFileName(book.title);
      const needsTimelineImage = format === 'word' && selectedSections.has('timeline') && !!timelineSvgMarkup;
      const timelineImage: TimelineImageData | null = needsTimelineImage
        ? {
            base64: await captureTimelineImage(timelineCaptureRef),
            width: timelineLayout.width,
            height: timelineLayout.height,
          }
        : null;

      if (format === 'pdf') {
        const html = buildExportHtml(book, sections);
        if (Platform.OS === 'web') {
          printHtmlOnWeb(html);
        } else {
          const { uri } = await Print.printToFileAsync({ html });
          const destination = new File(Paths.cache, `${fileName}.pdf`);
          if (destination.exists) destination.delete();
          await new File(uri).copy(destination, { overwrite: true });
          await Sharing.shareAsync(destination.uri, { mimeType: 'application/pdf', dialogTitle: 'Exporter le manuscrit' });
        }
      } else {
        const base64 = await buildExportDocx(book, sections, timelineImage);
        if (Platform.OS === 'web') {
          downloadBlobOnWeb(base64ToBlob(base64, DOCX_MIME_TYPE), `${fileName}.docx`);
        } else {
          const destination = new File(Paths.cache, `${fileName}.docx`);
          if (destination.exists) destination.delete();
          destination.create({ overwrite: true });
          destination.write(base64, { encoding: 'base64' });
          await Sharing.shareAsync(destination.uri, { mimeType: DOCX_MIME_TYPE, dialogTitle: 'Exporter le manuscrit' });
        }
      }
    } catch (error) {
      console.error("Échec de l'export du manuscrit :", error);
      showToast('Export impossible : une erreur est survenue pendant la génération du document. Réessayez.');
    } finally {
      setIsExporting(false);
    }
  };

  /** Sauvegarde l'intégralité des données du livre dans un fichier JSON, pour pouvoir les recharger sur un autre appareil. */
  const handleSaveProject = async () => {
    setIsSavingProject(true);
    try {
      const json = JSON.stringify(book, null, 2);
      const fileName = `${sanitizeFileName(book.title)}.json`;
      if (Platform.OS === 'web') {
        downloadBlobOnWeb(new Blob([json], { type: 'application/json' }), fileName);
      } else {
        const destination = new File(Paths.cache, fileName);
        if (destination.exists) destination.delete();
        destination.create({ overwrite: true });
        destination.write(json);
        await Sharing.shareAsync(destination.uri, { mimeType: 'application/json', dialogTitle: 'Sauvegarder le projet' });
      }
    } catch (error) {
      console.error('Échec de la sauvegarde du projet :', error);
      showToast('Sauvegarde impossible : une erreur est survenue pendant la génération du fichier. Réessayez.');
    } finally {
      setIsSavingProject(false);
    }
  };

  const allSelected = selectedSections.size === EXPORTABLE_SECTIONS.length;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Format</Text>
        <View style={[styles.formatSwitch, { borderColor: theme.border }]}>
          <Pressable
            onPress={() => setFormat('pdf')}
            style={[styles.formatOption, format === 'pdf' && { backgroundColor: ACCENT_COLOR }]}
          >
            <Text style={[styles.formatLabel, { color: format === 'pdf' ? '#ffffff' : theme.text }]}>PDF</Text>
          </Pressable>
          <Pressable
            onPress={() => setFormat('word')}
            style={[styles.formatOption, format === 'word' && { backgroundColor: ACCENT_COLOR }]}
          >
            <Text style={[styles.formatLabel, { color: format === 'word' ? '#ffffff' : theme.text }]}>Word</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.field}>
        <View style={styles.sectionsHeader}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Sections à exporter</Text>
          <Pressable onPress={toggleSelectAll}>
            <Text style={[styles.selectAllLabel, { color: ACCENT_COLOR }]}>
              {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionsGrid}>
          {EXPORTABLE_SECTIONS.map((section) => {
            const checked = selectedSections.has(section.id);
            return (
              <Pressable key={section.id} onPress={() => toggleSection(section.id)} style={styles.sectionRow}>
                <View style={[styles.checkbox, { borderColor: section.color }, checked && { backgroundColor: section.color }]}>
                  {checked && <Check size={12} color="#ffffff" />}
                </View>
                <Text style={[styles.sectionLabel, { color: theme.text }]}>{section.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={handleExport}
        disabled={isExporting}
        style={[styles.exportButton, { backgroundColor: ACCENT_COLOR, opacity: isExporting ? 0.7 : 1 }]}
      >
        {isExporting ? <ActivityIndicator size="small" color="#ffffff" /> : <Upload size={16} color="#ffffff" />}
        <Text style={styles.exportButtonLabel}>{isExporting ? 'Génération en cours…' : 'Exporter le manuscrit'}</Text>
      </Pressable>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Sauvegarde du projet</Text>
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Exporte toutes les données du livre (bible, personnages, lieux, timeline, scènes) dans un fichier que vous
          pourrez recharger sur un autre appareil, depuis l'étagère.
        </Text>
        <Pressable
          onPress={handleSaveProject}
          disabled={isSavingProject}
          style={[styles.saveButton, { borderColor: theme.border, opacity: isSavingProject ? 0.7 : 1 }]}
        >
          {isSavingProject ? (
            <ActivityIndicator size="small" color={theme.text} />
          ) : (
            <Save size={16} color={theme.text} />
          )}
          <Text style={[styles.saveButtonLabel, { color: theme.text }]}>
            {isSavingProject ? 'Génération en cours…' : 'Sauvegarder le projet'}
          </Text>
        </Pressable>
      </View>

      {timelineSvgMarkup && (
        <TimelineCaptureLayer
          ref={timelineCaptureRef}
          svgMarkup={timelineSvgMarkup}
          width={timelineLayout.width}
          height={timelineLayout.height}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingBottom: 40,
  },
  field: {
    marginBottom: Spacing.five,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
  },
  formatSwitch: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radii.card,
    overflow: 'hidden',
  },
  formatOption: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  formatLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  selectAllLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    width: '50%',
    paddingVertical: Spacing.two,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 14,
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.three,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  saveButtonLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Radii.card,
    paddingVertical: Spacing.three,
    marginBottom: Spacing.five,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.five,
  },
  exportButtonLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
