"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
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
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { adminFetch, adminMutation, AdminApiError, type PagedResult } from "@/lib/admin-api-client";
import type {
  AdminCountryRow,
  AdminEmissionRow,
  AdminSectorShareRow,
} from "@/lib/admin-types";
import { cohereTokens } from "@/theme";

const PAGE_SIZE = 20;

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

export function AdminPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab = (searchParams.get("tab") as TabKey | null) ?? "countries";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const queryClient = useQueryClient();

  const countriesQuery = useQuery({
    queryKey: ["admin", "countries", page],
    queryFn: () => adminFetch<PagedResult<AdminCountryRow>>(`/api/admin/countries?page=${page}&pageSize=${PAGE_SIZE}`),
    enabled: tab === "countries",
  });

  const emissionsQuery = useQuery({
    queryKey: ["admin", "emissions", page],
    queryFn: () => adminFetch<PagedResult<AdminEmissionRow>>(`/api/admin/emissions?page=${page}&pageSize=${PAGE_SIZE}`),
    enabled: tab === "emissions",
  });

  const sectorQuery = useQuery({
    queryKey: ["admin", "sectorShares", page],
    queryFn: () => adminFetch<PagedResult<AdminSectorShareRow>>(`/api/admin/sector-shares?page=${page}&pageSize=${PAGE_SIZE}`),
    enabled: tab === "sectorShares",
  });

  const loading = countriesQuery.isLoading || emissionsQuery.isLoading || sectorQuery.isLoading;
  const fetchError = (countriesQuery.error ?? emissionsQuery.error ?? sectorQuery.error) as AdminApiError | null;

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
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const handleTabChange = useCallback(
    (_: unknown, value: TabKey) => {
      const params = new URLSearchParams();
      params.set("tab", value);
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router],
  );

  const handlePageChange = useCallback(
    (_: unknown, newPage: number) => {
      setParam("page", String(newPage + 1));
    },
    [setParam],
  );

  async function runMutation<T>(operation: () => Promise<T>) {
    setSaving(true);
    setMutationError(null);
    try {
      const result = await operation();
      await invalidateQueries();
      return result;
    } catch (err) {
      setMutationError(err instanceof AdminApiError ? err.code : "INTERNAL_ERROR");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function invalidateQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin"] }),
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
      setMutationError("INVALID_PARAMS");
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
    setCountryDialog(null);
  }

  async function saveEmission() {
    if (!emissionDialog) return;
    const body = emissionBody(emissionDialog.values);
    if (!body.countryCode || Number.isNaN(body.year)) {
      setMutationError("INVALID_PARAMS");
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
    setEmissionDialog(null);
  }

  async function saveSectorShare() {
    if (!sectorDialog) return;
    const body = sectorBody(sectorDialog.values);
    if (!body.countryCode || Number.isNaN(body.year)) {
      setMutationError("INVALID_PARAMS");
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
    setDeleteTarget(null);
  }

  const countryRows = countriesQuery.data?.data ?? [];
  const emissionRows = emissionsQuery.data?.data ?? [];
  const sectorRows = sectorQuery.data?.data ?? [];

  const currentTotal =
    tab === "countries"
      ? countriesQuery.data?.total
      : tab === "emissions"
        ? emissionsQuery.data?.total
        : sectorQuery.data?.total;

  return (
    <Box component="main" sx={{ bgcolor: cohereTokens.colors.canvas, flex: 1, display: "flex", flexDirection: "column" }}>
      <Stack spacing={3} sx={{ maxWidth: 1600, mx: "auto", px: { xs: 2, sm: 3 }, py: { xs: 3, md: 4 }, width: "100%" }}>
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
          {currentTotal !== undefined ? (
            <Typography color="text.secondary" variant="body2">
              {currentTotal} records
            </Typography>
          ) : null}
        </Stack>

        {fetchError ? <Alert severity="error">Failed to load data: {fetchError}</Alert> : null}
        {mutationError ? <Alert severity="error">Mutation failed: {mutationError}</Alert> : null}

        <Paper variant="outlined" sx={{ borderColor: cohereTokens.colors.cardBorder, overflow: "hidden" }}>
          <Tabs
            aria-label="Admin CRUD sections"
            onChange={handleTabChange}
            value={tab}
            variant="scrollable"
          >
            <Tab label="Countries" value="countries" />
            <Tab label="Annual emissions" value="emissions" />
            <Tab label="Sector shares" value="sectorShares" />
          </Tabs>
          <Box sx={{ p: { xs: 1.5, md: 3 }, position: "relative", minHeight: 120 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <>
                {tab === "countries" ? (
                  <CountriesPanel
                    page={page - 1}
                    pageSize={PAGE_SIZE}
                    rows={countryRows}
                    total={countriesQuery.data?.total ?? 0}
                    onCreate={() => setCountryDialog({ mode: "create", values: emptyCountryForm() })}
                    onDelete={(row) => setDeleteTarget({ type: "country", row })}
                    onEdit={(row) => setCountryDialog({ mode: "edit", row, values: countryForm(row) })}
                    onPageChange={handlePageChange}
                  />
                ) : null}
                {tab === "emissions" ? (
                  <EmissionsPanel
                    page={page - 1}
                    pageSize={PAGE_SIZE}
                    rows={emissionRows}
                    total={emissionsQuery.data?.total ?? 0}
                    onCreate={() => setEmissionDialog({ mode: "create", values: emptyEmissionForm() })}
                    onDelete={(row) => setDeleteTarget({ type: "emission", row })}
                    onEdit={(row) => setEmissionDialog({ mode: "edit", row, values: emissionForm(row) })}
                    onPageChange={handlePageChange}
                  />
                ) : null}
                {tab === "sectorShares" ? (
                  <SectorSharesPanel
                    page={page - 1}
                    pageSize={PAGE_SIZE}
                    rows={sectorRows}
                    total={sectorQuery.data?.total ?? 0}
                    onCreate={() => setSectorDialog({ mode: "create", values: emptySectorForm() })}
                    onDelete={(row) => setDeleteTarget({ type: "sectorShare", row })}
                    onEdit={(row) => setSectorDialog({ mode: "edit", row, values: sectorForm(row) })}
                    onPageChange={handlePageChange}
                  />
                ) : null}
              </>
            )}
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
  onPageChange,
  onCreate,
  onDelete,
  onEdit,
  page,
  pageSize,
  rows,
  total,
}: {
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  onCreate: () => void;
  onDelete: (row: AdminCountryRow) => void;
  onEdit: (row: AdminCountryRow) => void;
  page: number;
  pageSize: number;
  rows: AdminCountryRow[];
  total: number;
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
          <TableFooter>
            <TableRow>
              <TablePagination
                count={total}
                onPageChange={onPageChange}
                page={page}
                rowsPerPage={pageSize}
                rowsPerPageOptions={[pageSize]}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Stack>
  );
}

function EmissionsPanel({
  onPageChange,
  onCreate,
  onDelete,
  onEdit,
  page,
  pageSize,
  rows,
  total,
}: {
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  onCreate: () => void;
  onDelete: (row: AdminEmissionRow) => void;
  onEdit: (row: AdminEmissionRow) => void;
  page: number;
  pageSize: number;
  rows: AdminEmissionRow[];
  total: number;
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
          <TableFooter>
            <TableRow>
              <TablePagination
                count={total}
                colSpan={emissionFields.length + 3}
                onPageChange={onPageChange}
                page={page}
                rowsPerPage={pageSize}
                rowsPerPageOptions={[pageSize]}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Stack>
  );
}

function SectorSharesPanel({
  onPageChange,
  onCreate,
  onDelete,
  onEdit,
  page,
  pageSize,
  rows,
  total,
}: {
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  onCreate: () => void;
  onDelete: (row: AdminSectorShareRow) => void;
  onEdit: (row: AdminSectorShareRow) => void;
  page: number;
  pageSize: number;
  rows: AdminSectorShareRow[];
  total: number;
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
          <TableFooter>
            <TableRow>
              <TablePagination
                count={total}
                colSpan={sectorFields.length + 3}
                onPageChange={onPageChange}
                page={page}
                rowsPerPage={pageSize}
                rowsPerPageOptions={[pageSize]}
              />
            </TableRow>
          </TableFooter>
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

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function deleteTargetLabel(target: DeleteTarget) {
  if (target.type === "country") return "country";
  if (target.type === "emission") return "annual emission";
  return "sector share";
}
