"use client";

import { useState } from "react";

import {
  AdminField,
  AdminShellForm,
  fieldClassName,
} from "@/components/admin/admin-shell-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminStatusBadge,
  AdminTable,
  AdminTableHead,
  AdminTableToolbarSearch,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import type {
  ProductStatus,
  ProjectSkillLevel,
  RobotProject,
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

export function AdminProjectsShell({ projects }: { projects: RobotProject[] }) {
  const [editing, setEditing] = useState<RobotProject | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Robot projects"
        description={`${projects.length} projects · form shell only — no persistence.`}
        actions={
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setEditing(null);
              setShowCreate(true);
            }}
          >
            New project
          </Button>
        }
        toolbar={
          <>
            <AdminTableToolbarSearch placeholder="Search projects (demo)" />
            <p className="text-xs text-muted-foreground">
              Skill levels: Beginner → Competition
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
          {projects.map((project) => (
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCreate(false);
                    setEditing(project);
                  }}
                >
                  Edit
                </Button>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>

      {showCreate || editing ? (
        <AdminShellForm
          title={
            editing ? `Edit project · ${editing.name}` : "Create project"
          }
          noun="project"
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing(null);
              setShowCreate(false);
            }}
          >
            Cancel
          </Button>
        </AdminShellForm>
      ) : null}
    </div>
  );
}
