"use client";

import { type FormEvent, useState } from "react";

import {
  AdminBomEditor,
  type AdminBomLine,
} from "@/components/admin/admin-bom-editor";
import { AdminDeleteTrigger } from "@/components/admin/admin-confirm-delete-dialog";
import {
  AdminField,
  AdminFormDialog,
  fieldClassName,
} from "@/components/admin/admin-form-dialog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminPagination,
  useAdminPagination,
} from "@/components/admin/admin-pagination";
import {
  AdminStatusBadge,
  AdminTable,
  AdminTableHead,
  AdminTd,
  AdminTh,
  catalogStatusTone,
} from "@/components/admin/admin-table";
import { useAdminSave } from "@/components/admin/use-admin-save";
import { Button } from "@/components/ui/button";
import type { AdminProductOption } from "@/lib/admin";
import { saveProjectAction, setProjectStatusAction } from "@/lib/admin/catalog-actions";
import { projectInputSchema } from "@/lib/admin/catalog-schemas";
import type { ProductStatus, ProjectComponent, RobotProject } from "@/lib/catalog";
import { PRODUCT_STATUS_VALUES, PROJECT_SKILL_LEVEL_VALUES } from "@/lib/db/schema/shared";

type AdminProjectsShellProps = {
  projects: RobotProject[];
  /** All project components across every project — filtered per project when a BOM dialog opens. */
  projectComponents: ProjectComponent[];
  productOptions: AdminProductOption[];
};

/** Robot projects backed by real D1 writes (tasks/phase-19-admin-catalog/125). */
export function AdminProjectsShell({
  projects: rows,
  projectComponents,
  productOptions,
}: AdminProjectsShellProps) {
  const [editing, setEditing] = useState<RobotProject | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [bom, setBom] = useState<AdminBomLine[]>([]);
  const save = useAdminSave();
  const dialogOpen = showCreate || editing !== null;
  const pagination = useAdminPagination(rows, 20);

  function openCreate() {
    save.setError(null);
    setEditing(null);
    setBom([]);
    setShowCreate(true);
  }

  function openEdit(project: RobotProject) {
    save.setError(null);
    setBom(
      projectComponents
        .filter((component) => component.projectId === project.id)
        .map((component) => ({
          productId: component.productId,
          quantity: component.quantity,
          optional: component.optional,
        })),
    );
    setShowCreate(false);
    setEditing(project);
  }

  function closeDialog() {
    setShowCreate(false);
    setEditing(null);
    setBom([]);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input = {
      name: form.get("name"),
      slug: form.get("slug"),
      shortDescription: form.get("shortDescription"),
      description: form.get("description"),
      skillLevel: form.get("skillLevel"),
      status: form.get("status"),
      featured: form.get("featured") === "on",
      imageUrl: form.get("imageUrl"),
      imageAlt: form.get("imageAlt"),
      components: bom,
    };
    const parsed = projectInputSchema.safeParse(input);
    if (!parsed.success) {
      save.setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    const projectId = editing?.id ?? null;
    const result = await save.run(
      () => saveProjectAction(projectId, input),
      projectId ? `Saved “${parsed.data.name}”.` : `Created “${parsed.data.name}”.`,
    );
    if (result?.ok) closeDialog();
  }

  function changeStatus(project: RobotProject, status: ProductStatus, message: string) {
    void save.run(() => setProjectStatusAction(project.id, status), message);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Robot projects"
        description={`${rows.length} projects · Saved to the database. Components must be existing products and feed the Robot Builder.`}
        actions={
          <Button type="button" size="sm" onClick={openCreate}>
            New project
          </Button>
        }
      />

      <AdminTable>
        <AdminTableHead>
          <AdminTh>Name</AdminTh>
          <AdminTh>Skill level</AdminTh>
          <AdminTh>Status</AdminTh>
          <AdminTh>Featured</AdminTh>
          <AdminTh className="text-right">Actions</AdminTh>
        </AdminTableHead>
        <tbody>
          {pagination.pageItems.map((project) => (
            <tr key={project.id} className="hover:bg-muted/30">
              <AdminTd>
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.slug}</p>
                </div>
              </AdminTd>
              <AdminTd>
                <AdminStatusBadge tone="neutral">{project.skillLevel}</AdminStatusBadge>
              </AdminTd>
              <AdminTd>
                <AdminStatusBadge tone={catalogStatusTone(project.status)}>{project.status}</AdminStatusBadge>
              </AdminTd>
              <AdminTd>
                <AdminStatusBadge tone={project.featured ? "success" : "neutral"}>
                  {project.featured ? "Featured" : "Standard"}
                </AdminStatusBadge>
              </AdminTd>
              <AdminTd className="text-right">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => openEdit(project)}>
                    Edit
                  </Button>
                  {project.status === "ARCHIVED" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => changeStatus(project, "DRAFT", `“${project.name}” restored as a draft.`)}
                    >
                      Restore
                    </Button>
                  ) : (
                    <AdminDeleteTrigger
                      itemLabel={`the project “${project.name}”`}
                      title="Archive project?"
                      description={`“${project.name}” will be hidden from the store and the Robot Builder. You can restore it later.`}
                      buttonLabel="Archive"
                      buttonVariant="destructive"
                      onConfirm={() => changeStatus(project, "ARCHIVED", `“${project.name}” archived.`)}
                    />
                  )}
                </div>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>

      <AdminPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />

      {save.status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {save.status}
        </p>
      ) : null}
      {save.error && !dialogOpen ? (
        <p className="text-sm text-destructive" role="alert">
          {save.error}
        </p>
      ) : null}

      <AdminFormDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title={editing ? `Edit project · ${editing.name}` : "Create project"}
        noun="project"
        description="Pick products that already exist. If a part is missing, add it under Products first."
        submitLabel={save.pending ? "Saving…" : "Save project"}
        onSubmit={onSubmit}
        className="sm:max-w-2xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField id="admin-project-name" label="Name">
            <input id="admin-project-name" name="name" defaultValue={editing?.name ?? ""} className={fieldClassName()} />
          </AdminField>
          <AdminField id="admin-project-slug" label="Slug (blank = from name)">
            <input id="admin-project-slug" name="slug" defaultValue={editing?.slug ?? ""} className={fieldClassName()} />
          </AdminField>
          <AdminField id="admin-project-skill" label="Skill level">
            <select
              id="admin-project-skill"
              name="skillLevel"
              defaultValue={editing?.skillLevel ?? "BEGINNER"}
              className={fieldClassName()}
            >
              {PROJECT_SKILL_LEVEL_VALUES.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField id="admin-project-status" label="Status">
            <select id="admin-project-status" name="status" defaultValue={editing?.status ?? "DRAFT"} className={fieldClassName()}>
              {PRODUCT_STATUS_VALUES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField id="admin-project-image" label="Image URL">
            <input
              id="admin-project-image"
              name="imageUrl"
              placeholder="https://…"
              defaultValue={editing?.imageUrl ?? ""}
              className={fieldClassName()}
            />
          </AdminField>
          <AdminField id="admin-project-image-alt" label="Image alt text">
            <input
              id="admin-project-image-alt"
              name="imageAlt"
              defaultValue={editing?.imageAlt ?? ""}
              className={fieldClassName()}
            />
          </AdminField>
          <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
            <input type="checkbox" name="featured" defaultChecked={editing?.featured ?? false} />
            Featured on the homepage
          </label>
          <div className="sm:col-span-2">
            <AdminField id="admin-project-short" label="Short description">
              <textarea
                id="admin-project-short"
                name="shortDescription"
                rows={2}
                defaultValue={editing?.shortDescription ?? ""}
                className={`${fieldClassName()} min-h-16 py-2`}
              />
            </AdminField>
          </div>
          <div className="sm:col-span-2">
            <AdminField id="admin-project-description" label="Description">
              <textarea
                id="admin-project-description"
                name="description"
                rows={4}
                defaultValue={editing?.description ?? ""}
                className={`${fieldClassName()} min-h-24 py-2`}
              />
            </AdminField>
          </div>
        </div>

        <AdminBomEditor
          lines={bom}
          onChange={setBom}
          products={productOptions}
          title="Project components (from stock products)"
          emptyLabel="Project box is empty. Search a product from stock and add it."
          searchInputId="project-product-search"
          showOptional
        />

        {save.error ? (
          <p className="text-sm text-destructive" role="alert">
            {save.error}
          </p>
        ) : null}
      </AdminFormDialog>
    </div>
  );
}
