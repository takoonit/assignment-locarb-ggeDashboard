"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { adminMutation, AdminApiError } from "@/lib/admin-api-client";
import type {
  AdminCountryRow,
  AdminEmissionRow,
  AdminSectorShareRow,
} from "@/lib/admin-types";
import { cohereTokens } from "@/theme";

type AdminPageClientProps = {
  countries: AdminCountryRow[];
  emissions: AdminEmissionRow[];
  sectorShares: AdminSectorShareRow[];
};

type TabKey = "countries" | "emissions" | "sectorShares";
type DialogMode = "create" | "edit";
type DeleteTarget =
  | { type: "country"; row: AdminCountryRow }
  | { type: "emission"; row: AdminEmissionRow }
  | { type: "sectorShare"; row: AdminSectorShareRow };

const emissionFields = ["total", "co2", "ch4", "n2o", "hfc", "pfc", "sf6"] as const;
const sectorFields = ["transport", "manufacturing", "electricity", "buildings", "other"] as const;

type EmissionField = (typeof emissionFields)[number];
type SectorField = (typeof sectorFields)[number];

type CountryForm = { code: string; name: string; isRegion: boolean };
type EmissionForm = Record<"countryCode" | "year" | EmissionField, string>;
type SectorForm = Record<"countryCode" | "year" | SectorField, string>;

export function AdminPageClient({
  countries,
  emissions,
  sectorShares,
}: AdminPageClientProps) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabKey>("countries");
  const [countryRows, setCountryRows] = useState(countries);
  const [emissionRows, setEmissionRows] = useState(emissions);
  const [sectorRows, setSectorRows] = useState(sectorShares);
  const [countryDialog, setCountryDialog] = useState<null | {
    mode: DialogMode;
    row?: AdminCountryRow;
    values: CountryForm;
  }>(null);
  const [emissionDialog, setEmissionDialog] = useState<null | {
    mode: DialogMode;
    row?: AdminEmissionRow;
    values: EmissionForm;
  }>(null);
  const [sectorDialog, setSectorDialog] = useState<null | {
    mode: DialogMode;
    row?: AdminSectorShareRow;
    values: SectorForm;
  }>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const currentRows = useMemo(
    () => ({
      countries: countryRows.length,
      emissions: emissionRows.length,
      sectorShares: sectorRows.length,
    }),
    [countryRows.length, emissionRows.length, sectorRows.length],
  );

  async function runMutation<T>(operation: () => Promise<T>) {
    setSaving(true);
    setError(null);
    try {
      const result = await operation();
      await invalidateDashboardQueries();
      return result;
    } catch (mutationError) {
      setError(mutationError instanceof AdminApiError ? mutationError.code : "INTERNAL_ERROR");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function invalidateDashboardQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["countries"] }),
      queryClient.invalidateQueries({ queryKey: ["emissions"] }),
    ]);
  }

  async function saveCountry() {
    if (!countryDialog) return;
    const body = {
      code: countryDialog.values.code.trim().toUpperCase(),
      name: countryDialog.values.name.trim(),
      isRegion: countryDialog.values.isRegion,
    };
    if (!body.code || !body.name) {
      setError("INVALID_PARAMS");
      return;
    }

    const saved = await runMutation(() =>
      countryDialog.mode === "create"
        ? adminMutation<AdminCountryRow>("/api/countries", { method: "POST", body })
        : adminMutation<AdminCountryRow>(`/api/countries/${countryDialog.row!.id}`, {
            method: "PATCH",
            body,
          }),
    );
    if (!saved) return;

    setCountryRows((rows) =>
      countryDialog.mode === "create"
        ? sortCountries([...rows, saved])
        : sortCountries(rows.map((row) => (row.id === saved.id ? saved : row))),
    );
    setCountryDialog(null);
  }

  async function saveEmission() {
    if (!emissionDialog) return;
    const body = emissionBody(emissionDialog.values);
    if (!body.countryCode || Number.isNaN(body.year)) {
      setError("INVALID_PARAMS");
      return;
    }

    const saved = await runMutation(() =>
      emissionDialog.mode === "create"
        ? adminMutation<AdminEmissionRow>("/api/emissions", { method: "POST", body })
        : adminMutation<AdminEmissionRow>(`/api/emissions/${emissionDialog.row!.id}`, {
            method: "PATCH",
            body: stripCountryCode(body),
          }),
    );
    if (!saved) return;

    setEmissionRows((rows) =>
      emissionDialog.mode === "create"
        ? sortEmissions([...rows, saved])
        : sortEmissions(rows.map((row) => (row.id === saved.id ? saved : row))),
    );
    setEmissionDialog(null);
  }

  async function saveSectorShare() {
    if (!sectorDialog) return;
    const body = sectorBody(sectorDialog.values);
    if (!body.countryCode || Number.isNaN(body.year)) {
      setError("INVALID_PARAMS");
      return;
    }

    const saved = await runMutation(() =>
      sectorDialog.mode === "create"
        ? adminMutation<AdminSectorShareRow>("/api/sector-shares", { method: "POST", body })
        : adminMutation<AdminSectorShareRow>(`/api/sector-shares/${sectorDialog.row!.id}`, {
            method: "PATCH",
            body: stripCountryCode(body),
          }),
    );
    if (!saved) return;

    setSectorRows((rows) =>
      sectorDialog.mode === "create"
        ? sortSectorShares([...rows, saved])
        : sortSectorShares(rows.map((row) => (row.id === saved.id ? saved : row))),
    );
    setSectorDialog(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    const deleted = await runMutation(() => {
      if (deleteTarget.type === "country") {
        return adminMutation<{ deleted: true; id: string }>(
          `/api/countries/${deleteTarget.row.id}`,
          { method: "DELETE" },
        );
      }
      if (deleteTarget.type === "emission") {
        return adminMutation<{ deleted: true; id: string }>(
          `/api/emissions/${deleteTarget.row.id}`,
          { method: "DELETE" },
        );
      }
      return adminMutation<{ deleted: true; id: string }>(
        `/api/sector-shares/${deleteTarget.row.id}`,
        { method: "DELETE" },
      );
    });
    if (!deleted) return;

    if (deleteTarget.type === "country") {
      setCountryRows((rows) => rows.filter((row) => row.id !== deleted.id));
    } else if (deleteTarget.type === "emission") {
      setEmissionRows((rows) => rows.filter((row) => row.id !== deleted.id));
    } else {
      setSectorRows((rows) => rows.filter((row) => row.id !== deleted.id));
    }
    setDeleteTarget(null);
  }

  return (
    <Box component="main" sx={{ bgcolor: cohereTokens.colors.canvas, minHeight: "100vh" }}>
      <Stack spacing={3} sx={{ maxWidth: 1440, mx: "auto", px: { xs: 2, md: 3 }, py: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{
            alignItems: { md: "flex-end" },
            borderBottom: `1px solid ${cohereTokens.colors.hairline}`,
            justifyContent: "space-between",
            pb: 2,
          }}
        >
          <Box>
            <Typography component="h1" variant="h1" sx={{ fontSize: { xs: 30, md: 38 }, letterSpacing: 0 }}>
              Admin data maintenance
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Protected CRUD for countries, annual emissions, and sector shares.
            </Typography>
          </Box>
          <Typography color="text.secondary" variant="body2">
            {currentRows.countries} countries · {currentRows.emissions} annual records ·{" "}
            {currentRows.sectorShares} sector records
          </Typography>
        </Stack>

        {error ? <Alert severity="error">Mutation failed: {error}</Alert> : null}

        <Paper variant="outlined" sx={{ borderColor: cohereTokens.colors.cardBorder, overflow: "hidden" }}>
          <Tabs
            aria-label="Admin CRUD sections"
            onChange={(_event, value: TabKey) => setTab(value)}
            value={tab}
            variant="scrollable"
          >
            <Tab label="Countries" value="countries" />
            <Tab label="Annual emissions" value="emissions" />
            <Tab label="Sector shares" value="sectorShares" />
          </Tabs>
          <Box sx={{ p: { xs: 1.5, md: 2 } }}>
            {tab === "countries" ? (
              <CountriesPanel
                rows={countryRows}
                onCreate={() => setCountryDialog({ mode: "create", values: emptyCountryForm() })}
                onDelete={(row) => setDeleteTarget({ type: "country", row })}
                onEdit={(row) => setCountryDialog({ mode: "edit", row, values: countryForm(row) })}
              />
            ) : null}
            {tab === "emissions" ? (
              <EmissionsPanel
                rows={emissionRows}
                onCreate={() => setEmissionDialog({ mode: "create", values: emptyEmissionForm() })}
                onDelete={(row) => setDeleteTarget({ type: "emission", row })}
                onEdit={(row) => setEmissionDialog({ mode: "edit", row, values: emissionForm(row) })}
              />
            ) : null}
            {tab === "sectorShares" ? (
              <SectorSharesPanel
                rows={sectorRows}
                onCreate={() => setSectorDialog({ mode: "create", values: emptySectorForm() })}
                onDelete={(row) => setDeleteTarget({ type: "sectorShare", row })}
                onEdit={(row) => setSectorDialog({ mode: "edit", row, values: sectorForm(row) })}
              />
            ) : null}
          </Box>
        </Paper>
      </Stack>

      <CountryDialog
        dialog={countryDialog}
        disabled={saving}
        onClose={() => setCountryDialog(null)}
        onSave={saveCountry}
        onValues={(values) => setCountryDialog((dialog) => (dialog ? { ...dialog, values } : null))}
      />
      <EmissionDialog
        dialog={emissionDialog}
        disabled={saving}
        onClose={() => setEmissionDialog(null)}
        onSave={saveEmission}
        onValues={(values) => setEmissionDialog((dialog) => (dialog ? { ...dialog, values } : null))}
      />
      <SectorDialog
        dialog={sectorDialog}
        disabled={saving}
        onClose={() => setSectorDialog(null)}
        onSave={saveSectorShare}
        onValues={(values) => setSectorDialog((dialog) => (dialog ? { ...dialog, values } : null))}
      />
      <DeleteDialog
        disabled={saving}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
}

function CountriesPanel({
  rows,
  onCreate,
  onDelete,
  onEdit,
}: {
  rows: AdminCountryRow[];
  onCreate: () => void;
  onDelete: (row: AdminCountryRow) => void;
  onEdit: (row: AdminCountryRow) => void;
}) {
  return (
    <Stack spacing={2}>
      <PanelHeader title="Countries" action="Create country" onCreate={onCreate} />
      <TableContainer>
        <Table size="small" aria-label="Countries table">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Region</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.isRegion ? "Yes" : "No"}</TableCell>
                <TableCell align="right">
                  <RowActions
                    deleteLabel="Delete country"
                    editLabel="Edit country"
                    onDelete={() => onDelete(row)}
                    onEdit={() => onEdit(row)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

function EmissionsPanel({
  rows,
  onCreate,
  onDelete,
  onEdit,
}: {
  rows: AdminEmissionRow[];
  onCreate: () => void;
  onDelete: (row: AdminEmissionRow) => void;
  onEdit: (row: AdminEmissionRow) => void;
}) {
  return (
    <Stack spacing={2}>
      <PanelHeader title="Annual emissions" action="Create annual emission" onCreate={onCreate} />
      <TableContainer>
        <Table size="small" aria-label="Annual emissions table">
          <TableHead>
            <TableRow>
              <TableCell>Country</TableCell>
              <TableCell>Year</TableCell>
              {emissionFields.map((field) => (
                <TableCell key={field}>{field.toUpperCase()}</TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.countryCode}</TableCell>
                <TableCell>{row.year}</TableCell>
                {emissionFields.map((field) => (
                  <TableCell key={field}>{formatNullable(row[field])}</TableCell>
                ))}
                <TableCell align="right">
                  <RowActions
                    deleteLabel="Delete annual emission"
                    editLabel="Edit annual emission"
                    onDelete={() => onDelete(row)}
                    onEdit={() => onEdit(row)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

function SectorSharesPanel({
  rows,
  onCreate,
  onDelete,
  onEdit,
}: {
  rows: AdminSectorShareRow[];
  onCreate: () => void;
  onDelete: (row: AdminSectorShareRow) => void;
  onEdit: (row: AdminSectorShareRow) => void;
}) {
  return (
    <Stack spacing={2}>
      <PanelHeader title="Sector shares" action="Create sector share" onCreate={onCreate} />
      <TableContainer>
        <Table size="small" aria-label="Sector shares table">
          <TableHead>
            <TableRow>
              <TableCell>Country</TableCell>
              <TableCell>Year</TableCell>
              {sectorFields.map((field) => (
                <TableCell key={field}>{titleCase(field)}</TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.countryCode}</TableCell>
                <TableCell>{row.year}</TableCell>
                {sectorFields.map((field) => (
                  <TableCell key={field}>{formatNullable(row[field])}</TableCell>
                ))}
                <TableCell align="right">
                  <RowActions
                    deleteLabel="Delete sector share"
                    editLabel="Edit sector share"
                    onDelete={() => onDelete(row)}
                    onEdit={() => onEdit(row)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

function PanelHeader({
  action,
  onCreate,
  title,
}: {
  action: string;
  onCreate: () => void;
  title: string;
}) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ justifyContent: "space-between" }}>
      <Typography component="h2" variant="h3" sx={{ fontSize: 22 }}>
        {title}
      </Typography>
      <Button onClick={onCreate} startIcon={<AddIcon />} variant="contained">
        {action}
      </Button>
    </Stack>
  );
}

function RowActions({
  deleteLabel,
  editLabel,
  onDelete,
  onEdit,
}: {
  deleteLabel: string;
  editLabel: string;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
      <Tooltip title={editLabel}>
        <IconButton aria-label={editLabel} onClick={onEdit} size="small">
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={deleteLabel}>
        <IconButton aria-label={deleteLabel} color="error" onClick={onDelete} size="small">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

function CountryDialog({
  dialog,
  disabled,
  onClose,
  onSave,
  onValues,
}: {
  dialog: null | { mode: DialogMode; values: CountryForm };
  disabled: boolean;
  onClose: () => void;
  onSave: () => void;
  onValues: (values: CountryForm) => void;
}) {
  if (!dialog) return null;
  const title = dialog.mode === "create" ? "Create country" : "Edit country";

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open aria-labelledby="country-dialog-title">
      <DialogTitle id="country-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Code"
            onChange={(event) => onValues({ ...dialog.values, code: event.target.value })}
            required
            slotProps={{ htmlInput: { "aria-label": "Code", maxLength: 3 } }}
            value={dialog.values.code}
          />
          <TextField
            label="Name"
            onChange={(event) => onValues({ ...dialog.values, name: event.target.value })}
            required
            slotProps={{ htmlInput: { "aria-label": "Name" } }}
            value={dialog.values.name}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={dialog.values.isRegion}
                onChange={(event) => onValues({ ...dialog.values, isRegion: event.target.checked })}
              />
            }
            label="Region"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={disabled} onClick={onClose}>Cancel</Button>
        <Button disabled={disabled} onClick={onSave} variant="contained">
          {dialog.mode === "create" ? "Create" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EmissionDialog({
  dialog,
  disabled,
  onClose,
  onSave,
  onValues,
}: {
  dialog: null | { mode: DialogMode; values: EmissionForm };
  disabled: boolean;
  onClose: () => void;
  onSave: () => void;
  onValues: (values: EmissionForm) => void;
}) {
  if (!dialog) return null;
  const title = dialog.mode === "create" ? "Create annual emission" : "Edit annual emission";

  return (
    <Dialog fullWidth maxWidth="md" onClose={onClose} open aria-labelledby="emission-dialog-title">
      <DialogTitle id="emission-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              disabled={dialog.mode === "edit"}
              label="Country code"
              onChange={(event) => onValues({ ...dialog.values, countryCode: event.target.value })}
              required
              slotProps={{ htmlInput: { "aria-label": "Country code", maxLength: 3 } }}
              value={dialog.values.countryCode}
            />
            <TextField
              label="Year"
              onChange={(event) => onValues({ ...dialog.values, year: event.target.value })}
              required
              slotProps={{ htmlInput: { "aria-label": "Year" } }}
              type="number"
              value={dialog.values.year}
            />
          </Stack>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" } }}>
            {emissionFields.map((field) => (
              <TextField
                key={field}
                label={field.toUpperCase()}
                onChange={(event) => onValues({ ...dialog.values, [field]: event.target.value })}
                slotProps={{ htmlInput: { "aria-label": field.toUpperCase() } }}
                type="number"
                value={dialog.values[field]}
              />
            ))}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={disabled} onClick={onClose}>Cancel</Button>
        <Button disabled={disabled} onClick={onSave} variant="contained">
          {dialog.mode === "create" ? "Create" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SectorDialog({
  dialog,
  disabled,
  onClose,
  onSave,
  onValues,
}: {
  dialog: null | { mode: DialogMode; values: SectorForm };
  disabled: boolean;
  onClose: () => void;
  onSave: () => void;
  onValues: (values: SectorForm) => void;
}) {
  if (!dialog) return null;
  const title = dialog.mode === "create" ? "Create sector share" : "Edit sector share";

  return (
    <Dialog fullWidth maxWidth="md" onClose={onClose} open aria-labelledby="sector-dialog-title">
      <DialogTitle id="sector-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              disabled={dialog.mode === "edit"}
              label="Country code"
              onChange={(event) => onValues({ ...dialog.values, countryCode: event.target.value })}
              required
              slotProps={{ htmlInput: { "aria-label": "Country code", maxLength: 3 } }}
              value={dialog.values.countryCode}
            />
            <TextField
              label="Year"
              onChange={(event) => onValues({ ...dialog.values, year: event.target.value })}
              required
              slotProps={{ htmlInput: { "aria-label": "Year" } }}
              type="number"
              value={dialog.values.year}
            />
          </Stack>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" } }}>
            {sectorFields.map((field) => (
              <TextField
                key={field}
                label={titleCase(field)}
                onChange={(event) => onValues({ ...dialog.values, [field]: event.target.value })}
                slotProps={{ htmlInput: { "aria-label": titleCase(field) } }}
                type="number"
                value={dialog.values[field]}
              />
            ))}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={disabled} onClick={onClose}>Cancel</Button>
        <Button disabled={disabled} onClick={onSave} variant="contained">
          {dialog.mode === "create" ? "Create" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteDialog({
  disabled,
  onClose,
  onConfirm,
  target,
}: {
  disabled: boolean;
  onClose: () => void;
  onConfirm: () => void;
  target: DeleteTarget | null;
}) {
  if (!target) return null;
  const label = deleteTargetLabel(target);

  return (
    <Dialog fullWidth maxWidth="xs" onClose={onClose} open aria-labelledby="delete-dialog-title">
      <DialogTitle id="delete-dialog-title">Delete {label}</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          This action cannot be undone. Confirm deletion before changing the dataset.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button disabled={disabled} onClick={onClose}>Cancel</Button>
        <Button color="error" disabled={disabled} onClick={onConfirm} variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function formatNullable(value: number | null) {
  return value === null ? "No data" : String(value);
}

function emptyCountryForm(): CountryForm {
  return { code: "", name: "", isRegion: false };
}

function countryForm(row: AdminCountryRow): CountryForm {
  return { code: row.code, name: row.name, isRegion: row.isRegion };
}

function emptyEmissionForm(): EmissionForm {
  return {
    countryCode: "",
    year: "",
    total: "",
    co2: "",
    ch4: "",
    n2o: "",
    hfc: "",
    pfc: "",
    sf6: "",
  };
}

function emissionForm(row: AdminEmissionRow): EmissionForm {
  return {
    countryCode: row.countryCode,
    year: String(row.year),
    total: valueToInput(row.total),
    co2: valueToInput(row.co2),
    ch4: valueToInput(row.ch4),
    n2o: valueToInput(row.n2o),
    hfc: valueToInput(row.hfc),
    pfc: valueToInput(row.pfc),
    sf6: valueToInput(row.sf6),
  };
}

function emptySectorForm(): SectorForm {
  return {
    countryCode: "",
    year: "",
    transport: "",
    manufacturing: "",
    electricity: "",
    buildings: "",
    other: "",
  };
}

function sectorForm(row: AdminSectorShareRow): SectorForm {
  return {
    countryCode: row.countryCode,
    year: String(row.year),
    transport: valueToInput(row.transport),
    manufacturing: valueToInput(row.manufacturing),
    electricity: valueToInput(row.electricity),
    buildings: valueToInput(row.buildings),
    other: valueToInput(row.other),
  };
}

function emissionBody(values: EmissionForm) {
  return {
    countryCode: values.countryCode.trim().toUpperCase(),
    year: Number(values.year),
    total: inputToNumber(values.total),
    co2: inputToNumber(values.co2),
    ch4: inputToNumber(values.ch4),
    n2o: inputToNumber(values.n2o),
    hfc: inputToNumber(values.hfc),
    pfc: inputToNumber(values.pfc),
    sf6: inputToNumber(values.sf6),
  };
}

function sectorBody(values: SectorForm) {
  return {
    countryCode: values.countryCode.trim().toUpperCase(),
    year: Number(values.year),
    transport: inputToNumber(values.transport),
    manufacturing: inputToNumber(values.manufacturing),
    electricity: inputToNumber(values.electricity),
    buildings: inputToNumber(values.buildings),
    other: inputToNumber(values.other),
  };
}

function inputToNumber(value: string) {
  return value.trim() === "" ? null : Number(value);
}

function valueToInput(value: number | null) {
  return value === null ? "" : String(value);
}

function stripCountryCode<T extends { countryCode: string }>(body: T): Omit<T, "countryCode"> {
  const { countryCode, ...rest } = body;
  void countryCode;
  return rest;
}

function sortCountries(rows: AdminCountryRow[]) {
  return [...rows].sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code));
}

function sortEmissions(rows: AdminEmissionRow[]) {
  return [...rows].sort((a, b) => a.countryCode.localeCompare(b.countryCode) || b.year - a.year);
}

function sortSectorShares(rows: AdminSectorShareRow[]) {
  return [...rows].sort((a, b) => a.countryCode.localeCompare(b.countryCode) || b.year - a.year);
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function deleteTargetLabel(target: DeleteTarget) {
  if (target.type === "country") return "country";
  if (target.type === "emission") return "annual emission";
  return "sector share";
}
