"use client";

import { useState } from "react";

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
  AdminTableToolbarSearch,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import type { AdminProductOption } from "@/lib/admin";
import {
  type ProductStatus,
  type ProjectComponent,
  type ProjectSkillLevel,
  type RobotProject,
} from "@/lib/catalog";

function statusTone(status: ProductStatus) {
  if (status === "PUBLISHED") return "success" as const;
  if (status === "DRAFT") return "warning" as const;
  return "neutral" as const;
}

const SKILL_LEVELS: ProjectSkillLevel[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "COMPETITION",
];

type AdminProjectsShellProps = {
  projects: RobotProject[];
  /** All project components across every project — filtered per project when a BOM dialog opens. */
  projectComponents: ProjectComponent[];
  productOptions: AdminProductOption[];
};

export function AdminProjectsShell({
  projects: initialProjects,
  projectComponents,
  productOptions,
}: AdminProjectsShellProps) {
  const [rows, setRows] = useState(initialProjects);
  const [editing, setEditing] = useState<RobotProject | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [bom, setBom] = useState<AdminBomLine[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const dialogOpen = showCreate || editing !== null;
  const pagination = useAdminPagination(rows, 20);

  function openCreate() {
    setEditing(null);
    setBom([]);
    setShowCreate(true);
  }

  function openEdit(project: RobotProject) {
    const components = projectComponents.filter(
      (component) => component.projectId === project.id,
    );
    setBom(
      components.map((component) => ({
        productId: component.productId,
        quantity: component.quantity,
      })),
    );
    setShowCreate(false);
    setEditing(project);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Robot projects"
        description={`${rows.length} projects · required parts must come from Products. Delete always asks for confirmation.`}
        actions={
          <Button type="button" size="sm" onClick={openCreate}>
            New project
          </Button>
        }
        toolbar={
          <>
            <AdminTableToolbarSearch placeholder="Search projects (demo)" />
            <p className="text-xs text-muted-foreground">
              Add product first, then attach here
            </p>
          </>
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
                <AdminStatusBadge tone="neutral">
                  {project.skillLevel}
                </AdminStatusBadge>
              </AdminTd>
              <AdminTd>
                <AdminStatusBadge tone={statusTone(project.status)}>
                  {project.status}
                </AdminStatusBadge>
              </AdminTd>
              <AdminTd>
                <AdminStatusBadge
                  tone={project.featured ? "success" : "neutral"}
                >
                  {project.featured ? "Featured" : "Standard"}
                </AdminStatusBadge>
              </AdminTd>
              <AdminTd className="text-right">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(project)}
                  >
                    Edit
                  </Button>
                  <AdminDeleteTrigger
                    itemLabel={`the project “${project.name}”`}
                    title="Delete project?"
                    description={`Are you sure you want to delete “${project.name}”? Demo only — this removes it from the admin list in this session.`}
                    buttonLabel="Delete"
                    buttonVariant="destructive"
                    onConfirm={() => {
                      setRows((current) =>
                        current.filter((row) => row.id !== project.id),
                      );
                      setStatus(
                        `Demo only — “${project.name}” was removed from this list.`,
                      );
                    }}
                  />
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

      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}

      <AdminFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreate(false);
            setEditing(null);
            setBom([]);
          }
        }}
        title={
          editing ? `Edit project · ${editing.name}` : "Create project"
        }
        noun="project"
        description="Pick products that already exist. If wheels (or any part) are missing, add them under Products first."
        className="sm:max-w-2xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField id="admin-project-name" label="Name">
            <input
              id="admin-project-name"
              name="name"
              defaultValue={editing?.name ?? ""}
              className={fieldClassName()}
            />
          </AdminField>
          <AdminField id="admin-project-slug" label="Slug">
            <input
              id="admin-project-slug"
              name="slug"
              defaultValue={editing?.slug ?? ""}
              className={fieldClassName()}
            />
          </AdminField>
          <AdminField id="admin-project-skill" label="Skill level">
            <select
              id="admin-project-skill"
              name="skillLevel"
              defaultValue={editing?.skillLevel ?? "BEGINNER"}
              className={fieldClassName()}
            >
              {SKILL_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField id="admin-project-status" label="Status">
            <select
              id="admin-project-status"
              name="status"
              defaultValue={editing?.status ?? "DRAFT"}
              className={fieldClassName()}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </AdminField>
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
        </div>

        <AdminBomEditor
          lines={bom}
          onChange={setBom}
          products={productOptions}
          title="Project components (from stock products)"
          emptyLabel="Project box is empty. Search a product from stock and add it."
          searchInputId="project-product-search"
        />
      </AdminFormDialog>
    </div>
  );
}
