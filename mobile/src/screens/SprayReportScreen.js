import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSubmitReportMutation } from '../hooks/useFieldData';
import { getCurrentLocation } from '../lib/location';
import { enqueue, isOnline, updateQueuedReport } from '../lib/offlineQueue';
import PhotoPicker from '../components/PhotoPicker';
import { pilgrimTheme } from '../theme/pilgrimTheme';

const steps = ['Place', 'Coverage', 'Services', 'Evidence', 'Review'];

function numberFromString(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function createReportSchema(maxRooms) {
  return z
    .object({
      roomsEligible: z.string().min(1, 'Enter eligible rooms'),
      roomsSprayed: z.string().min(1, 'Enter rooms sprayed'),
      roomsNotSprayed: z.string().optional(),
      reasonLocked: z.string().optional(),
      reasonRefused: z.string().optional(),
      reasonUnsafe: z.string().optional(),
      reasonOther: z.string().optional(),
      studentsProtected: z.string().optional(),
      peopleProtected: z.string().optional(),
      educationConducted: z.boolean(),
      educationStudentsReached: z.string().optional(),
      educationTopic: z.string().optional(),
      chemopreventionProvided: z.boolean(),
      chemopreventionStudentsReached: z.string().optional(),
      chemopreventionDoses: z.string().optional(),
      larvalSourceConducted: z.boolean(),
      larvalSitesChecked: z.string().optional(),
      larvalSitesTreated: z.string().optional(),
      larvalNotes: z.string().optional(),
      insecticideProduct: z.string().optional(),
      insecticideBatch: z.string().optional(),
      insecticideQuantity: z.string().optional(),
      insecticideUnit: z.string().optional(),
      ppeWorn: z.boolean(),
      occupantsCleared: z.boolean(),
      roomsVentilated: z.boolean(),
      headTeacherBriefed: z.boolean(),
      headTeacherName: z.string().optional(),
      supervisorName: z.string().optional(),
      notes: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      const eligible = numberFromString(values.roomsEligible);
      const sprayed = numberFromString(values.roomsSprayed);
      const notSprayed = numberFromString(values.roomsNotSprayed || '0');
      if (!Number.isInteger(eligible) || eligible < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['roomsEligible'], message: 'Eligible rooms must be a positive number' });
      }
      if (!Number.isInteger(sprayed) || sprayed < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['roomsSprayed'], message: 'Rooms sprayed must be a positive number' });
      }
      if (!Number.isInteger(notSprayed) || notSprayed < 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['roomsNotSprayed'], message: 'Unsprayed rooms cannot be negative' });
      }
      if (maxRooms && eligible > maxRooms) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['roomsEligible'], message: `Eligible rooms cannot exceed ${maxRooms}` });
      }
      if (maxRooms && sprayed > maxRooms) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['roomsSprayed'], message: `Rooms sprayed cannot exceed ${maxRooms}` });
      }
      if (sprayed + notSprayed > eligible) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['roomsNotSprayed'], message: 'Sprayed plus unsprayed rooms must fit eligible rooms' });
      }
    });
}

function toWhole(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

function trimmed(value) {
  return String(value || '').trim();
}

function FieldInput({ control, name, label, placeholder, multiline = false, keyboardType = 'default', errors }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, multiline && styles.notesInput]}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor="#999"
            keyboardType={keyboardType}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
            selectionColor={pilgrimTheme.colors.primaryDeep}
            cursorColor={pilgrimTheme.colors.primaryDeep}
          />
        )}
      />
      {errors?.[name] ? <Text style={styles.errorText}>{errors[name].message}</Text> : null}
    </>
  );
}

function ToggleField({ control, name, label, detail }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <TouchableOpacity
          style={[styles.toggleRow, value && styles.toggleRowActive]}
          onPress={() => onChange(!value)}
          activeOpacity={0.82}
        >
          <View style={[styles.checkbox, value && styles.checkboxActive]}>
            <Text style={[styles.checkboxText, value && styles.checkboxTextActive]}>{value ? '✓' : ''}</Text>
          </View>
          <View style={styles.toggleCopy}>
            <Text style={styles.toggleLabel}>{label}</Text>
            {detail ? <Text style={styles.toggleDetail}>{detail}</Text> : null}
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

export default function SprayReportScreen({ route, navigation }) {
  const { school, queuedReport } = route.params;
  const editingQueuedReport = Boolean(queuedReport?.id);
  const [step, setStep] = useState(0);
  const [date, setDate] = useState(
    queuedReport?.date ? new Date(queuedReport.date) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [photos, setPhotos] = useState(queuedReport?.localPhotos || []);
  const [gpsCoords, setGpsCoords] = useState(queuedReport?.gpsCoords || null);
  const [gpsLoading, setGpsLoading] = useState(!queuedReport?.gpsCoords);
  const [onlineNow, setOnlineNow] = useState(true);
  const submitMutation = useSubmitReportMutation();

  const schema = useMemo(() => createReportSchema(school.totalRooms || 0), [school.totalRooms]);
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      roomsEligible: String(queuedReport?.roomsEligible || school.totalRooms || ''),
      roomsSprayed: String(queuedReport?.roomsSprayed || ''),
      roomsNotSprayed: String(queuedReport?.roomsNotSprayed || '0'),
      reasonLocked: String(queuedReport?.notSprayedReasons?.locked || '0'),
      reasonRefused: String(queuedReport?.notSprayedReasons?.refused || '0'),
      reasonUnsafe: String(queuedReport?.notSprayedReasons?.unsafe || '0'),
      reasonOther: String(queuedReport?.notSprayedReasons?.other || '0'),
      studentsProtected: String(queuedReport?.studentsProtected || school.studentCount || ''),
      peopleProtected: String(queuedReport?.peopleProtected || school.studentCount || ''),
      educationConducted: Boolean(queuedReport?.educationSession?.conducted),
      educationStudentsReached: String(queuedReport?.educationSession?.studentsReached || ''),
      educationTopic: queuedReport?.educationSession?.topic || '',
      chemopreventionProvided: Boolean(queuedReport?.chemoprevention?.provided),
      chemopreventionStudentsReached: String(queuedReport?.chemoprevention?.studentsReached || ''),
      chemopreventionDoses: String(queuedReport?.chemoprevention?.dosesAdministered || ''),
      larvalSourceConducted: Boolean(queuedReport?.larvalSourceManagement?.conducted),
      larvalSitesChecked: String(queuedReport?.larvalSourceManagement?.sitesChecked || ''),
      larvalSitesTreated: String(queuedReport?.larvalSourceManagement?.sitesTreated || ''),
      larvalNotes: queuedReport?.larvalSourceManagement?.notes || '',
      insecticideProduct: queuedReport?.insecticide?.product || '',
      insecticideBatch: queuedReport?.insecticide?.batchNumber || '',
      insecticideQuantity: String(queuedReport?.insecticide?.quantityUsed || ''),
      insecticideUnit: queuedReport?.insecticide?.unit || 'sachets',
      ppeWorn: Boolean(queuedReport?.safetyChecklist?.ppeWorn),
      occupantsCleared: Boolean(queuedReport?.safetyChecklist?.occupantsCleared),
      roomsVentilated: Boolean(queuedReport?.safetyChecklist?.roomsVentilated),
      headTeacherBriefed: Boolean(queuedReport?.safetyChecklist?.headTeacherBriefed),
      headTeacherName: queuedReport?.headTeacherName || '',
      supervisorName: queuedReport?.supervisorName || '',
      notes: queuedReport?.notes || '',
    },
  });

  useEffect(() => {
    (async () => {
      if (!queuedReport?.gpsCoords) {
        const coords = await getCurrentLocation();
        setGpsCoords(coords);
        setGpsLoading(false);
      }
      setOnlineNow(await isOnline());
    })();
  }, [queuedReport?.gpsCoords]);

  const educationConducted = watch('educationConducted');
  const chemopreventionProvided = watch('chemopreventionProvided');
  const larvalSourceConducted = watch('larvalSourceConducted');
  const roomsEligible = watch('roomsEligible');
  const roomsSprayed = watch('roomsSprayed');
  const roomsNotSprayed = watch('roomsNotSprayed');
  const notesValue = watch('notes');
  const coveragePct = numberFromString(roomsEligible)
    ? Math.round((numberFromString(roomsSprayed) / numberFromString(roomsEligible)) * 100)
    : 0;

  const dateStr = date.toLocaleDateString('en-UG', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const goNext = async () => {
    if (step === 1) {
      const valid = await trigger(['roomsEligible', 'roomsSprayed', 'roomsNotSprayed']);
      if (!valid) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
    }
    await Haptics.selectionAsync();
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = async () => {
    await Haptics.selectionAsync();
    setStep((current) => Math.max(current - 1, 0));
  };

  const buildPayload = (values) => {
    const serviceTypes = ['irs'];
    if (values.educationConducted) serviceTypes.push('education');
    if (values.chemopreventionProvided) serviceTypes.push('chemoprevention');
    if (values.larvalSourceConducted) serviceTypes.push('larval-source-management');

    return {
      school: school._id,
      date: date.toISOString(),
      roomsEligible: toWhole(values.roomsEligible),
      roomsSprayed: toWhole(values.roomsSprayed),
      roomsNotSprayed: toWhole(values.roomsNotSprayed),
      notSprayedReasons: {
        locked: toWhole(values.reasonLocked),
        refused: toWhole(values.reasonRefused),
        unsafe: toWhole(values.reasonUnsafe),
        other: toWhole(values.reasonOther),
      },
      studentsProtected: toWhole(values.studentsProtected),
      peopleProtected: toWhole(values.peopleProtected),
      serviceTypes,
      insecticide: {
        product: trimmed(values.insecticideProduct),
        batchNumber: trimmed(values.insecticideBatch),
        quantityUsed: Number(values.insecticideQuantity || 0),
        unit: trimmed(values.insecticideUnit) || 'sachets',
      },
      educationSession: {
        conducted: values.educationConducted,
        studentsReached: toWhole(values.educationStudentsReached),
        topic: trimmed(values.educationTopic),
      },
      chemoprevention: {
        provided: values.chemopreventionProvided,
        studentsReached: toWhole(values.chemopreventionStudentsReached),
        dosesAdministered: toWhole(values.chemopreventionDoses),
      },
      larvalSourceManagement: {
        conducted: values.larvalSourceConducted,
        sitesChecked: toWhole(values.larvalSitesChecked),
        sitesTreated: toWhole(values.larvalSitesTreated),
        notes: trimmed(values.larvalNotes),
      },
      safetyChecklist: {
        ppeWorn: values.ppeWorn,
        occupantsCleared: values.occupantsCleared,
        roomsVentilated: values.roomsVentilated,
        headTeacherBriefed: values.headTeacherBriefed,
      },
      headTeacherName: trimmed(values.headTeacherName),
      supervisorName: trimmed(values.supervisorName),
      photos: [],
      notes: trimmed(values.notes),
      gpsCoords: gpsCoords || { lat: 0, lng: 0 },
    };
  };

  const submitOnlineOrQueue = async (values) => {
    const payload = buildPayload(values);
    const schoolSnapshot = {
      name: school.name,
      district: school.district,
      totalRooms: school.totalRooms,
      studentCount: school.studentCount,
    };

    if (editingQueuedReport) {
      const updated = await updateQueuedReport(queuedReport.id, {
        ...payload,
        localPhotos: photos,
        schoolSnapshot,
      });
      if (!updated) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Could not update', 'That queued report was no longer found on this device.');
        return;
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Queued report updated', 'Your changes were saved and will sync when connection is available.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    try {
      const online = await isOnline();
      setOnlineNow(online);

      if (online) {
        await submitMutation.mutateAsync({ payload, localPhotos: photos });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Submitted for review', 'This standardized service report is waiting for admin verification.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }

      const count = await enqueue({ ...payload, localPhotos: photos, schoolSnapshot });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved offline', `${count} report${count === 1 ? '' : 's'} will upload when connected.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      try {
        const count = await enqueue({ ...payload, localPhotos: photos, schoolSnapshot });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert('Saved offline', `Submission failed, so it was queued locally. ${count} waiting.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } catch {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', err?.response?.data?.error || 'Could not submit or save report.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            {editingQueuedReport ? 'Edit queued service report' : 'Standardized field service report'}
          </Text>
          <Text style={styles.title}>{school.name}</Text>
          <Text style={styles.subtitle}>
            {school.district} District · {school.totalRooms || 0} rooms · {school.studentCount || 0} students
          </Text>
        </View>

        <View style={styles.stepRow}>
          {steps.map((label, index) => (
            <View key={label} style={styles.stepItem}>
              <View style={[styles.stepDot, index <= step && styles.stepDotActive]}>
                <Text style={[styles.stepDotText, index <= step && styles.stepDotTextActive]}>{index + 1}</Text>
              </View>
              <Text style={[styles.stepLabel, index === step && styles.stepLabelActive]}>{label}</Text>
            </View>
          ))}
        </View>

        {step === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Confirm school and date</Text>
            <Text style={styles.cardCopy}>
              {editingQueuedReport
                ? 'Update this queued report before it syncs. Saving keeps it in the offline queue.'
                : 'This report becomes the source record for school service history, donor summaries, and annual program metrics.'}
            </Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>{dateStr}</Text>
            </TouchableOpacity>
            {showDatePicker ? (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                maximumDate={new Date()}
                onChange={(_event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) setDate(selectedDate);
                }}
                themeVariant="light"
                accentColor={pilgrimTheme.colors.primaryDeep}
              />
            ) : null}
            <View style={[styles.statusStrip, onlineNow ? styles.onlineStrip : styles.offlineStrip]}>
              <Text style={styles.statusStripText}>{onlineNow ? 'Online: report can submit now.' : 'Offline: report will queue on device.'}</Text>
            </View>
            <View style={styles.gpsRow}>
              <Text style={styles.gpsLabel}>GPS</Text>
              {gpsLoading ? (
                <ActivityIndicator size="small" color={pilgrimTheme.colors.primary} />
              ) : gpsCoords ? (
                <Text style={styles.gpsValue}>{gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)}</Text>
              ) : (
                <Text style={styles.gpsError}>Unavailable</Text>
              )}
            </View>
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>IRS coverage</Text>
            <Text style={styles.cardCopy}>Capture the standard structure coverage fields: eligible rooms, sprayed rooms, missed rooms, and why rooms were missed.</Text>
            <FieldInput control={control} name="roomsEligible" label="Eligible rooms" placeholder="Total rooms eligible for IRS" keyboardType="number-pad" errors={errors} />
            <FieldInput control={control} name="roomsSprayed" label="Rooms sprayed" placeholder={`Max ${school.totalRooms || 0}`} keyboardType="number-pad" errors={errors} />
            <FieldInput control={control} name="roomsNotSprayed" label="Rooms not sprayed" placeholder="0" keyboardType="number-pad" errors={errors} />
            <View style={styles.coverageCard}>
              <Text style={styles.coverageValue}>{coveragePct || 0}%</Text>
              <Text style={styles.coverageLabel}>calculated room coverage</Text>
            </View>
            <View style={styles.reasonGrid}>
              <FieldInput control={control} name="reasonLocked" label="Locked" placeholder="0" keyboardType="number-pad" errors={errors} />
              <FieldInput control={control} name="reasonRefused" label="Refused" placeholder="0" keyboardType="number-pad" errors={errors} />
              <FieldInput control={control} name="reasonUnsafe" label="Unsafe" placeholder="0" keyboardType="number-pad" errors={errors} />
              <FieldInput control={control} name="reasonOther" label="Other" placeholder="0" keyboardType="number-pad" errors={errors} />
            </View>
            <FieldInput control={control} name="studentsProtected" label="Students protected" placeholder="Students covered by service" keyboardType="number-pad" errors={errors} />
            <FieldInput control={control} name="peopleProtected" label="Total people protected" placeholder="Students plus staff/other residents" keyboardType="number-pad" errors={errors} />
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Services provided</Text>
            <Text style={styles.cardCopy}>IRS is always included. Add the other Pilgrim Protect services delivered during this visit.</Text>
            <ToggleField control={control} name="educationConducted" label="Malaria education session" detail="Students reached, club activity, or prevention teaching" />
            {educationConducted ? (
              <>
                <FieldInput control={control} name="educationStudentsReached" label="Education students reached" placeholder="0" keyboardType="number-pad" errors={errors} />
                <FieldInput control={control} name="educationTopic" label="Education topic" placeholder="Prevention, net use, fever response..." errors={errors} />
              </>
            ) : null}
            <ToggleField control={control} name="chemopreventionProvided" label="Chemoprevention provided" detail="Record students reached and doses administered" />
            {chemopreventionProvided ? (
              <>
                <FieldInput control={control} name="chemopreventionStudentsReached" label="Chemoprevention students reached" placeholder="0" keyboardType="number-pad" errors={errors} />
                <FieldInput control={control} name="chemopreventionDoses" label="Doses administered" placeholder="0" keyboardType="number-pad" errors={errors} />
              </>
            ) : null}
            <ToggleField control={control} name="larvalSourceConducted" label="Larval source management" detail="Breeding sites checked or treated" />
            {larvalSourceConducted ? (
              <>
                <FieldInput control={control} name="larvalSitesChecked" label="Sites checked" placeholder="0" keyboardType="number-pad" errors={errors} />
                <FieldInput control={control} name="larvalSitesTreated" label="Sites treated" placeholder="0" keyboardType="number-pad" errors={errors} />
                <FieldInput control={control} name="larvalNotes" label="Larval notes" placeholder="Drainage, standing water, follow-up..." multiline errors={errors} />
              </>
            ) : null}
          </View>
        ) : null}

        {step === 3 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Materials, safety, evidence</Text>
            <FieldInput control={control} name="insecticideProduct" label="Insecticide/product" placeholder="Product name" errors={errors} />
            <FieldInput control={control} name="insecticideBatch" label="Batch or lot number" placeholder="Batch/lot" errors={errors} />
            <FieldInput control={control} name="insecticideQuantity" label="Quantity used" placeholder="0" keyboardType="decimal-pad" errors={errors} />
            <FieldInput control={control} name="insecticideUnit" label="Unit" placeholder="sachets, bottles, grams..." errors={errors} />
            <Text style={styles.label}>Safety checklist</Text>
            <ToggleField control={control} name="ppeWorn" label="PPE worn" />
            <ToggleField control={control} name="occupantsCleared" label="Occupants cleared before spraying" />
            <ToggleField control={control} name="roomsVentilated" label="Ventilation/re-entry guidance given" />
            <ToggleField control={control} name="headTeacherBriefed" label="Head teacher or designee briefed" />
            <FieldInput control={control} name="headTeacherName" label="Head teacher/designee name" placeholder="Name" errors={errors} />
            <FieldInput control={control} name="supervisorName" label="Supervisor name" placeholder="Name" errors={errors} />
            <Text style={styles.label}>Photo evidence</Text>
            <PhotoPicker photos={photos} onPhotosChange={setPhotos} maxPhotos={5} />
            <FieldInput control={control} name="notes" label="Visit notes" placeholder="Access issues, rooms locked, school comments..." multiline errors={errors} />
          </View>
        ) : null}

        {step === 4 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Review before submit</Text>
            <View style={styles.reviewRow}><Text style={styles.reviewLabel}>IRS coverage</Text><Text style={styles.reviewValue}>{roomsSprayed || 0}/{roomsEligible || 0} rooms</Text></View>
            <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Not sprayed</Text><Text style={styles.reviewValue}>{roomsNotSprayed || 0}</Text></View>
            <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Photos</Text><Text style={styles.reviewValue}>{photos.length}</Text></View>
            <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Date</Text><Text style={styles.reviewValue}>{dateStr}</Text></View>
            <Text style={styles.reviewNote}>{notesValue || 'No notes added.'}</Text>
            <Text style={styles.cardCopy}>After submission, an admin verifies the report before it updates public school status or donor-facing impact metrics.</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 ? (
          <TouchableOpacity style={styles.secondaryBtn} onPress={goBack}>
            <Text style={styles.secondaryText}>Back</Text>
          </TouchableOpacity>
        ) : null}
        {step < steps.length - 1 ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={goNext}>
            <Text style={styles.primaryText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, submitMutation.isPending && styles.disabledBtn]}
            onPress={handleSubmit(submitOnlineOrQueue)}
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>
                {editingQueuedReport ? 'Save Queued Report' : 'Submit for Review'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: pilgrimTheme.colors.background },
  content: { padding: 18, paddingBottom: 116 },
  header: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: pilgrimTheme.colors.primaryDeep,
    ...pilgrimTheme.shadow.card,
  },
  eyebrow: { color: '#ffe2d2', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { marginTop: 6, color: '#fff', fontSize: 24, fontWeight: '900' },
  subtitle: { marginTop: 7, color: '#ffe9dd', fontSize: 14 },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16 },
  stepItem: { alignItems: 'center', flex: 1 },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
    backgroundColor: pilgrimTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: pilgrimTheme.colors.primaryDeep, borderColor: pilgrimTheme.colors.primaryDeep },
  stepDotText: { color: pilgrimTheme.colors.textMuted, fontWeight: '800' },
  stepDotTextActive: { color: '#fff' },
  stepLabel: { marginTop: 5, color: pilgrimTheme.colors.textMuted, fontSize: 10, fontWeight: '700' },
  stepLabelActive: { color: pilgrimTheme.colors.primaryDeep },
  card: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: pilgrimTheme.colors.surface,
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
    ...pilgrimTheme.shadow.soft,
  },
  cardTitle: { color: pilgrimTheme.colors.ink, fontSize: 20, fontWeight: '900' },
  cardCopy: { marginTop: 8, color: pilgrimTheme.colors.textMuted, fontSize: 14, lineHeight: 21 },
  statusStrip: { marginTop: 14, borderRadius: 14, padding: 12 },
  onlineStrip: { backgroundColor: pilgrimTheme.colors.successSurface },
  offlineStrip: { backgroundColor: pilgrimTheme.colors.warningSurface },
  statusStripText: { color: pilgrimTheme.colors.ink, fontSize: 13, fontWeight: '700' },
  gpsRow: { marginTop: 12, borderRadius: 14, padding: 13, backgroundColor: pilgrimTheme.colors.backgroundSoft },
  gpsLabel: { color: pilgrimTheme.colors.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '800' },
  gpsValue: { marginTop: 5, color: pilgrimTheme.colors.primaryDeep, fontWeight: '900', fontSize: 17 },
  gpsError: { marginTop: 5, color: pilgrimTheme.colors.dangerText, fontWeight: '800' },
  label: { marginTop: 16, marginBottom: 6, color: pilgrimTheme.colors.ink, fontSize: 14, fontWeight: '800' },
  dateBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: pilgrimTheme.colors.backgroundSoft,
  },
  dateText: { color: pilgrimTheme.colors.ink, fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: pilgrimTheme.colors.ink,
    backgroundColor: pilgrimTheme.colors.backgroundSoft,
  },
  notesInput: { minHeight: 96, paddingTop: 13 },
  errorText: { marginTop: 7, color: pilgrimTheme.colors.dangerText, fontSize: 13, fontWeight: '700' },
  coverageCard: {
    marginTop: 14,
    borderRadius: 16,
    padding: 14,
    backgroundColor: pilgrimTheme.colors.successSurface,
    alignItems: 'center',
  },
  coverageValue: { color: pilgrimTheme.colors.primaryDeep, fontSize: 30, fontWeight: '900' },
  coverageLabel: { color: pilgrimTheme.colors.ink, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7 },
  reasonGrid: { marginTop: 2 },
  toggleRow: {
    marginTop: 10,
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
    backgroundColor: pilgrimTheme.colors.backgroundSoft,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleRowActive: { borderColor: pilgrimTheme.colors.primaryDeep, backgroundColor: '#f1faf4' },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pilgrimTheme.colors.surface,
  },
  checkboxActive: { backgroundColor: pilgrimTheme.colors.primaryDeep, borderColor: pilgrimTheme.colors.primaryDeep },
  checkboxText: { color: pilgrimTheme.colors.textMuted, fontWeight: '900' },
  checkboxTextActive: { color: '#fff' },
  toggleCopy: { marginLeft: 10, flex: 1 },
  toggleLabel: { color: pilgrimTheme.colors.ink, fontSize: 14, fontWeight: '900' },
  toggleDetail: { marginTop: 2, color: pilgrimTheme.colors.textMuted, fontSize: 12, lineHeight: 17 },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: pilgrimTheme.colors.border,
    paddingVertical: 12,
  },
  reviewLabel: { color: pilgrimTheme.colors.textMuted, fontWeight: '700' },
  reviewValue: { color: pilgrimTheme.colors.ink, fontWeight: '900' },
  reviewNote: {
    marginTop: 14,
    padding: 13,
    borderRadius: 14,
    backgroundColor: pilgrimTheme.colors.backgroundSoft,
    color: pilgrimTheme.colors.textMuted,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: pilgrimTheme.colors.border,
    backgroundColor: pilgrimTheme.colors.surface,
  },
  primaryBtn: { flex: 1, borderRadius: 16, backgroundColor: pilgrimTheme.colors.primaryDeep, paddingVertical: 16, alignItems: 'center' },
  secondaryBtn: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
    paddingVertical: 16,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  secondaryText: { color: pilgrimTheme.colors.ink, fontWeight: '900', fontSize: 15 },
  disabledBtn: { opacity: 0.65 },
});
