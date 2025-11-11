"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  AlertCircle,
  Download,
  Eye,
  Loader2,
  FileJson,
  Edit,
  Trash2,
  Save,
  X,
  FileSpreadsheet,
  FileText,
  CheckSquare,
  Printer,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox" // Added for batch selection

const STATUSES = ["pendente", "analisado", "aceito", "recusado"]
const STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]

interface Enrollment {
  id: string
  protocol_number: string
  enrollment_number?: number // Added enrollment_number field
  status: string
  created_at: string
  student_name: string
  email: string
  phone_main: string
  phone_whatsapp?: string
  date_of_birth: string
  student_cpf?: string
  rg_student?: string
  nis?: string
  school_of_origin: string
  school_9th_network?: string
  school_6th_name?: string
  school_6th_network?: string
  school_7th_name?: string
  school_7th_network?: string
  school_8th_name?: string
  school_8th_network?: string
  education_network?: string
  address_neighborhood: string
  address_city: string
  address_state: string
  address_zip_code: string
  address_street: string
  address_number: string
  address_complement?: string
  father_name?: string
  father_rg?: string
  father_cpf?: string
  father_phone?: string
  mother_name?: string
  mother_rg?: string
  mother_cpf?: string
  mother_phone?: string
  responsible_type?: string
  other_responsible_name?: string
  other_responsible_relationship?: string
  other_responsible_rg?: string
  other_responsible_cpf?: string
  other_responsible_phone?: string
  competition_public_school?: boolean
  competition_private_school?: boolean
  competition_lives_in_neighborhood?: boolean
  competition_pcd?: boolean
  course_name?: string
  form_printed?: boolean
  form_printed_at?: string
  form_printed_by?: string
}

interface Course {
  id: string
  name: string
  code: string
  description: string
}

function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    pendente: "bg-yellow-100 text-yellow-800",
    analisado: "bg-blue-100 text-blue-800",
    aceito: "bg-green-100 text-green-800",
    recusado: "bg-red-100 text-red-800",
  }

  return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
}

function EnrollmentDetailModal({
  enrollment,
  open,
  onOpenChange,
}: {
  enrollment: Enrollment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!enrollment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Inscrição</DialogTitle>
          <DialogDescription>
            {enrollment.protocol_number}
            {enrollment.enrollment_number && ` • Nº ${enrollment.enrollment_number}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Informações Pessoais</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Nome</p>
                <p className="font-medium">{enrollment.student_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Data de Nascimento</p>
                <p className="font-medium">{new Date(enrollment.date_of_birth).toLocaleDateString("pt-BR")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{enrollment.email || "Não informado"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Telefone</p>
                <p className="font-medium">{enrollment.phone_main}</p>
              </div>
              {enrollment.student_cpf && (
                <div>
                  <p className="text-muted-foreground">CPF</p>
                  <p className="font-medium">{enrollment.student_cpf}</p>
                </div>
              )}
              {enrollment.rg_student && (
                <div>
                  <p className="text-muted-foreground">RG do Aluno</p>
                  <p className="font-medium">{enrollment.rg_student}</p>
                </div>
              )}
              {enrollment.nis && (
                <div>
                  <p className="text-muted-foreground">NIS</p>
                  <p className="font-medium">{enrollment.nis}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Endereço</h4>
            <p className="text-sm">
              {enrollment.address_street}, {enrollment.address_number}
              {enrollment.address_complement && ` - ${enrollment.address_complement}`}
            </p>
            <p className="text-sm">
              {enrollment.address_neighborhood}, {enrollment.address_city} - {enrollment.address_state}{" "}
              {enrollment.address_zip_code}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Inscrição</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {enrollment.enrollment_number && (
                <div>
                  <p className="text-muted-foreground">Número de Inscrição</p>
                  <p className="font-medium">{enrollment.enrollment_number}</p>
                </div>
              )}
              {enrollment.course_name && (
                <div>
                  <p className="text-muted-foreground">Curso</p>
                  <p className="font-medium">{enrollment.course_name}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Escola de Origem (9º ano)</p>
                <p className="font-medium">{enrollment.school_of_origin}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Data de Inscrição</p>
                <p className="font-medium">{new Date(enrollment.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">
                  <StatusBadge status={enrollment.status} />
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Filiação e Responsável</h4>
            <div className="space-y-3">
              {enrollment.father_name && (
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium">Pai: {enrollment.father_name}</p>
                  {enrollment.father_cpf && (
                    <p className="text-sm text-muted-foreground">CPF: {enrollment.father_cpf}</p>
                  )}
                  {enrollment.father_rg && <p className="text-sm text-muted-foreground">RG: {enrollment.father_rg}</p>}
                  {enrollment.father_phone && (
                    <p className="text-sm text-muted-foreground">{enrollment.father_phone}</p>
                  )}
                </div>
              )}
              {enrollment.mother_name && (
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium">Mãe: {enrollment.mother_name}</p>
                  {enrollment.mother_cpf && (
                    <p className="text-sm text-muted-foreground">CPF: {enrollment.mother_cpf}</p>
                  )}
                  {enrollment.mother_rg && <p className="text-sm text-muted-foreground">RG: {enrollment.mother_rg}</p>}
                  {enrollment.mother_phone && (
                    <p className="text-sm text-muted-foreground">{enrollment.mother_phone}</p>
                  )}
                </div>
              )}
              {enrollment.responsible_type === "outro" && enrollment.other_responsible_name && (
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-sm font-medium">Outro Responsável: {enrollment.other_responsible_name}</p>
                  {enrollment.other_responsible_relationship && (
                    <p className="text-sm text-muted-foreground">
                      Parentesco: {enrollment.other_responsible_relationship}
                    </p>
                  )}
                  {enrollment.other_responsible_cpf && (
                    <p className="text-sm text-muted-foreground">CPF: {enrollment.other_responsible_cpf}</p>
                  )}
                  {enrollment.other_responsible_rg && (
                    <p className="text-sm text-muted-foreground">RG: {enrollment.other_responsible_rg}</p>
                  )}
                  {enrollment.other_responsible_phone && (
                    <p className="text-sm text-muted-foreground">{enrollment.other_responsible_phone}</p>
                  )}
                </div>
              )}
              {enrollment.responsible_type && (
                <p className="text-sm text-muted-foreground">
                  Responsável pela educação:{" "}
                  {enrollment.responsible_type === "pai"
                    ? "Pai"
                    : enrollment.responsible_type === "mae"
                      ? "Mãe"
                      : "Outro"}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EnrollmentStatistics({ enrollments }: { enrollments: Enrollment[] }) {
  const stats = {
    total: enrollments.length,
    pendente: enrollments.filter((e) => e.status === "pendente").length,
    analisado: enrollments.filter((e) => e.status === "analisado").length,
    aceito: enrollments.filter((e) => e.status === "aceito").length,
    recusado: enrollments.filter((e) => e.status === "recusado").length,
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.total}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-yellow-700">Pendente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-yellow-700">{stats.pendente}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Analisado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-blue-700">{stats.analisado}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Aceito</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-700">{stats.aceito}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-700">Recusado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-700">{stats.recusado}</p>
        </CardContent>
      </Card>
    </div>
  )
}

function EditEnrollmentModal({
  enrollment,
  open,
  onOpenChange,
  onSave,
  courses,
}: {
  enrollment: Enrollment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updatedEnrollment: Enrollment) => void
  courses: Course[]
}) {
  const [editData, setEditData] = useState<Enrollment | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (enrollment) {
      setEditData({ ...enrollment })
    }
  }, [enrollment])

  if (!editData) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(editData)
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Save error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Inscrição</DialogTitle>
          <DialogDescription>{editData.protocol_number}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Curso</h4>
            <div className="space-y-2">
              <Label>Curso</Label>
              <Select
                value={editData.course_name || "none"}
                onValueChange={(value) =>
                  setEditData({ ...editData, course_name: value === "none" ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Sem curso --</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.name}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Informações Pessoais</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={editData.student_name}
                  onChange={(e) => setEditData({ ...editData, student_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={editData.date_of_birth}
                  onChange={(e) => setEditData({ ...editData, date_of_birth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input
                  value={editData.student_cpf || ""}
                  onChange={(e) => setEditData({ ...editData, student_cpf: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>RG do Aluno</Label>
                <Input
                  value={editData.rg_student || ""}
                  onChange={(e) => setEditData({ ...editData, rg_student: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>NIS (opcional)</Label>
                <Input value={editData.nis || ""} onChange={(e) => setEditData({ ...editData, nis: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email (opcional)</Label>
                <Input
                  value={editData.email || ""}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={editData.phone_main}
                  onChange={(e) => setEditData({ ...editData, phone_main: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Escola de Origem (9º ano)</Label>
                <Input
                  value={editData.school_of_origin}
                  onChange={(e) => setEditData({ ...editData, school_of_origin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Rede de Ensino (9º ano)</Label>
                <Select
                  value={editData.school_9th_network || "Pública"}
                  onValueChange={(value) => setEditData({ ...editData, school_9th_network: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pública">Pública</SelectItem>
                    <SelectItem value="Privada">Privada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Endereço</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rua</Label>
                <Input
                  value={editData.address_street}
                  onChange={(e) => setEditData({ ...editData, address_street: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Número</Label>
                <Input
                  value={editData.address_number}
                  onChange={(e) => setEditData({ ...editData, address_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Complemento</Label>
                <Input
                  value={editData.address_complement || ""}
                  onChange={(e) => setEditData({ ...editData, address_complement: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Bairro</Label>
                <Input
                  value={editData.address_neighborhood}
                  onChange={(e) => setEditData({ ...editData, address_neighborhood: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input
                  value={editData.address_city}
                  onChange={(e) => setEditData({ ...editData, address_city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={editData.address_state}
                  onValueChange={(value) => setEditData({ ...editData, address_state: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>CEP</Label>
                <Input
                  value={editData.address_zip_code}
                  onChange={(e) => setEditData({ ...editData, address_zip_code: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Filiação</h4>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <h5 className="font-medium mb-3">Pai</h5>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={editData.father_name || ""}
                      onChange={(e) => setEditData({ ...editData, father_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      value={editData.father_cpf || ""}
                      onChange={(e) => setEditData({ ...editData, father_cpf: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>RG</Label>
                    <Input
                      value={editData.father_rg || ""}
                      onChange={(e) => setEditData({ ...editData, father_rg: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={editData.father_phone || ""}
                      onChange={(e) => setEditData({ ...editData, father_phone: e.target.value })}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h5 className="font-medium mb-3">Mãe</h5>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={editData.mother_name || ""}
                      onChange={(e) => setEditData({ ...editData, mother_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      value={editData.mother_cpf || ""}
                      onChange={(e) => setEditData({ ...editData, mother_cpf: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>RG</Label>
                    <Input
                      value={editData.mother_rg || ""}
                      onChange={(e) => setEditData({ ...editData, mother_rg: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={editData.mother_phone || ""}
                      onChange={(e) => setEditData({ ...editData, mother_phone: e.target.value })}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Responsável pela Educação</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Quem é o responsável?</Label>
                <Select
                  value={editData.responsible_type || "pai"}
                  onValueChange={(value) => setEditData({ ...editData, responsible_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pai">Pai</SelectItem>
                    <SelectItem value="mae">Mãe</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editData.responsible_type === "outro" && (
                <Card className="p-4">
                  <h5 className="font-medium mb-3">Dados do Outro Responsável</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        value={editData.other_responsible_name || ""}
                        onChange={(e) => setEditData({ ...editData, other_responsible_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Parentesco</Label>
                      <Input
                        value={editData.other_responsible_relationship || ""}
                        onChange={(e) => setEditData({ ...editData, other_responsible_relationship: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CPF</Label>
                      <Input
                        value={editData.other_responsible_cpf || ""}
                        onChange={(e) => setEditData({ ...editData, other_responsible_cpf: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>RG</Label>
                      <Input
                        value={editData.other_responsible_rg || ""}
                        onChange={(e) => setEditData({ ...editData, other_responsible_rg: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Telefone</Label>
                      <Input
                        value={editData.other_responsible_phone || ""}
                        onChange={(e) => setEditData({ ...editData, other_responsible_phone: e.target.value })}
                      />
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AdminEnrollmentsTable() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [courseFilter, setCourseFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [apiKey, setApiKey] = useState("")
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [batchDialogOpen, setBatchDialogOpen] = useState(false)
  const [batchStatus, setBatchStatus] = useState<string>("aceito")
  const [isBatchUpdating, setIsBatchUpdating] = useState(false)
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null)
  const [markingPrintedId, setMarkingPrintedId] = useState<string | null>(null)

  useEffect(() => {
    const savedApiKey = localStorage.getItem("admin_api_key")
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("admin_api_key", apiKey)
    }
  }, [apiKey])

  useEffect(() => {
    const fetchCourses = async () => {
      if (!apiKey) return
      try {
        const response = await fetch("/api/admin/courses", {
          headers: { "x-api-key": apiKey },
        })
        if (response.ok) {
          const data = await response.json()
          setCourses(data.courses)
        }
      } catch (err) {
        console.error("[v0] Failed to fetch courses:", err)
      }
    }
    fetchCourses()
  }, [apiKey])

  const fetchEnrollments = async () => {
    setLoading(true)
    setError("")

    if (!apiKey) {
      setError("Chave API não configurada")
      setLoading(false)
      return
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(courseFilter !== "all" && { course: courseFilter }),
      })

      const response = await fetch(`/api/admin/enrollments?${params}`, {
        headers: { "x-api-key": apiKey },
      })

      if (!response.ok) {
        throw new Error("Erro ao buscar inscrições")
      }

      const data = await response.json()
      setEnrollments(data.enrollments)
      setTotalPages(data.pagination.pages)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnrollments()
    setSelectedIds(new Set())
  }, [page, statusFilter, courseFilter, apiKey])

  const updateStatus = async (enrollmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/enrollments/${enrollmentId}/status`, {
        method: "PATCH",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Erro ao atualizar status")

      setEnrollments((prev) => prev.map((e) => (e.id === enrollmentId ? { ...e, status: newStatus } : e)))
      if (selectedEnrollment?.id === enrollmentId) {
        setSelectedEnrollment({ ...selectedEnrollment, status: newStatus })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar")
    }
  }

  const saveEnrollment = async (updatedEnrollment: Enrollment) => {
    try {
      const response = await fetch(`/api/admin/enrollments/${updatedEnrollment.id}`, {
        method: "PATCH",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEnrollment),
      })

      if (!response.ok) throw new Error("Erro ao salvar alterações")

      const saved = await response.json()
      setEnrollments((prev) => prev.map((e) => (e.id === saved.id ? saved : e)))
      if (selectedEnrollment?.id === saved.id) {
        setSelectedEnrollment(saved)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar")
      throw err
    }
  }

  const deleteEnrollment = async (enrollmentId: string) => {
    try {
      const response = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: "DELETE",
        headers: { "x-api-key": apiKey },
      })

      if (!response.ok) throw new Error("Erro ao excluir inscrição")

      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId))
      setDeleteConfirmId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir")
    }
  }

  const batchUpdateStatus = async () => {
    if (selectedIds.size === 0) return

    setIsBatchUpdating(true)
    setError("")
    try {
      console.log("[v0] Batch update - Selected IDs:", Array.from(selectedIds))
      console.log("[v0] Batch update - New status:", batchStatus)

      const response = await fetch("/api/admin/enrollments/batch", {
        method: "PATCH",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollmentIds: Array.from(selectedIds),
          status: batchStatus,
        }),
      })

      console.log("[v0] Batch update - Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Batch update - Error response:", errorData)
        throw new Error(errorData.error || "Erro ao atualizar inscrições em lote")
      }

      const result = await response.json()
      console.log("[v0] Batch update - Success:", result)

      // Update local state
      setEnrollments((prev) => prev.map((e) => (selectedIds.has(e.id) ? { ...e, status: batchStatus } : e)))

      setSelectedIds(new Set())
      setBatchDialogOpen(false)

      // Refresh the list to ensure data is in sync
      await fetchEnrollments()
    } catch (err) {
      console.error("[v0] Batch update - Caught error:", err)
      setError(err instanceof Error ? err.message : "Erro ao atualizar em lote")
    } finally {
      setIsBatchUpdating(false)
    }
  }

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === enrollments.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(enrollments.map((e) => e.id)))
    }
  }

  const exportToJSON = () => {
    const dataStr = JSON.stringify(enrollments, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `enrollments_${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  const exportToPDF = async () => {
    try {
      const params = new URLSearchParams({
        format: "pdf",
        course: courseFilter,
        status: statusFilter,
      })

      const response = await fetch(`/api/admin/export?${params}`, {
        headers: { "x-api-key": apiKey },
      })

      if (!response.ok) throw new Error("Erro ao gerar PDF")

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `relatorio_inscricoes_${courseFilter}_${new Date().toISOString().split("T")[0]}.pdf`
      link.click()
      setExportDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao exportar PDF")
    }
  }

  const exportToCSV = async () => {
    try {
      const params = new URLSearchParams({
        format: "csv",
        course: courseFilter,
        status: statusFilter,
      })

      const response = await fetch(`/api/admin/export?${params}`, {
        headers: { "x-api-key": apiKey },
      })

      if (!response.ok) throw new Error("Erro ao gerar CSV")

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `inscricoes_${courseFilter}_${new Date().toISOString().split("T")[0]}.csv`
      link.click()
      setExportDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao exportar CSV")
    }
  }

  const handleDownloadPdf = async (enrollment: Enrollment) => {
    setDownloadingPdfId(enrollment.id)
    setError("")
    try {
      const response = await fetch(`/api/pdf/${enrollment.id}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Error response:", errorData)
        throw new Error(errorData.error || "Erro ao baixar PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ficha_inscricao_${enrollment.protocol_number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Error downloading PDF:", err)
      setError(err instanceof Error ? err.message : "Erro ao baixar o PDF. Tente novamente.")
    } finally {
      setDownloadingPdfId(null)
    }
  }

  const togglePrintedStatus = async (enrollment: Enrollment) => {
    setMarkingPrintedId(enrollment.id)
    setError("")
    try {
      console.log("[v0] Toggling printed status for enrollment:", enrollment.id)
      console.log("[v0] Current printed status:", enrollment.form_printed)
      console.log("[v0] API key present:", !!apiKey)

      const response = await fetch(`/api/admin/enrollments/${enrollment.id}/mark-printed`, {
        method: "PATCH",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ printed: !enrollment.form_printed }),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Error response:", errorData)
        throw new Error(errorData.error || "Erro ao atualizar status de impressão")
      }

      const result = await response.json()
      console.log("[v0] Success result:", result)

      setEnrollments((prev) =>
        prev.map((e) => (e.id === enrollment.id ? { ...e, form_printed: result.enrollment.form_printed } : e)),
      )
    } catch (err) {
      console.error("[v0] Error toggling printed status:", err)
      setError(err instanceof Error ? err.message : "Erro ao atualizar status de impressão")
    } finally {
      setMarkingPrintedId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Acesso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="text-sm font-medium">Chave API</label>
            <Input
              type="password"
              placeholder="Digite sua chave API"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {apiKey && !loading && enrollments.length > 0 && (
        <div className="flex gap-3 justify-end">
          <Button asChild variant="outline">
            <a href="/admin/reports">Relatórios</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/admin/access-codes">Códigos de Acesso</a>
          </Button>
        </div>
      )}

      {!loading && enrollments.length > 0 && <EnrollmentStatistics enrollments={enrollments} />}

      <Card>
        <CardHeader>
          <CardTitle>Inscrições</CardTitle>
          <CardDescription>Listagem de todas as inscrições do Processo Seletivo 2026</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4 flex-wrap justify-between">
            <div className="flex gap-4 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os cursos</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.name}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!loading && enrollments.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Relatório
                </Button>
                <Button variant="outline" size="sm" onClick={exportToJSON}>
                  <FileJson className="w-4 h-4 mr-2" />
                  Exportar JSON
                </Button>
              </div>
            )}
          </div>

          {selectedIds.size > 0 && (
            <Alert>
              <CheckSquare className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{selectedIds.size} inscrição(ões) selecionada(s)</span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setBatchDialogOpen(true)}>
                    Atualizar Status em Lote
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())}>
                    Limpar Seleção
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}

          {!loading && enrollments.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhuma inscrição encontrada</p>
          )}

          {!loading && enrollments.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Checkbox
                  checked={selectedIds.size === enrollments.length && enrollments.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm font-medium">Selecionar Todos</span>
              </div>

              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="p-4">
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={selectedIds.has(enrollment.id)}
                        onCheckedChange={() => toggleSelection(enrollment.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{enrollment.student_name}</p>
                        <p className="text-sm text-muted-foreground">{enrollment.protocol_number}</p>
                        {enrollment.enrollment_number && (
                          <p className="text-sm font-medium text-blue-600">
                            Nº de Inscrição: {enrollment.enrollment_number}
                          </p>
                        )}
                        {enrollment.course_name && (
                          <p className="text-sm text-muted-foreground">{enrollment.course_name}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{enrollment.email}</p>
                        <div className="mt-2 flex gap-2 items-center flex-wrap">
                          <StatusBadge status={enrollment.status} />
                          {enrollment.form_printed && (
                            <Badge className="bg-green-100 text-green-800">
                              <Printer className="w-3 h-3 mr-1" />
                              Ficha Impressa
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 items-start flex-wrap justify-end">
                      <Select
                        value={enrollment.status}
                        onValueChange={(newStatus) => updateStatus(enrollment.id, newStatus)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant={enrollment.form_printed ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePrintedStatus(enrollment)}
                        disabled={markingPrintedId === enrollment.id}
                        title={enrollment.form_printed ? "Marcar como não impressa" : "Marcar como impressa"}
                      >
                        {markingPrintedId === enrollment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Printer className="w-4 h-4" />
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEnrollment(enrollment)
                          setEditOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEnrollment(enrollment)
                          setDetailsOpen(true)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPdf(enrollment)}
                        disabled={downloadingPdfId === enrollment.id}
                      >
                        {downloadingPdfId === enrollment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>

                      {deleteConfirmId === enrollment.id ? (
                        <div className="flex gap-1">
                          <Button variant="destructive" size="sm" onClick={() => deleteEnrollment(enrollment.id)}>
                            Confirmar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(enrollment.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                    Anterior
                  </Button>
                  <span className="flex items-center">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <EnrollmentDetailModal enrollment={selectedEnrollment} open={detailsOpen} onOpenChange={setDetailsOpen} />

      <EditEnrollmentModal
        enrollment={selectedEnrollment}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={saveEnrollment}
        courses={courses}
      />

      <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Status em Lote</DialogTitle>
            <DialogDescription>
              Atualizar o status de {selectedIds.size} inscrição(ões) selecionada(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Novo Status</Label>
              <Select value={batchStatus} onValueChange={setBatchStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button onClick={batchUpdateStatus} disabled={isBatchUpdating} className="flex-1">
                {isBatchUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  "Confirmar Atualização"
                )}
              </Button>
              <Button variant="outline" onClick={() => setBatchDialogOpen(false)} disabled={isBatchUpdating}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Relatório de Inscrições</DialogTitle>
            <DialogDescription>
              Escolha o formato de exportação. Os dados serão organizados por curso em ordem alfabética.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Filtros Aplicados</Label>
              <div className="text-sm text-muted-foreground">
                <p>Curso: {courseFilter === "all" ? "Todos os cursos" : courseFilter}</p>
                <p>Status: {statusFilter === "all" ? "Todos os status" : statusFilter}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={exportToPDF} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Exportar como PDF
              </Button>
              <Button onClick={exportToCSV} variant="outline" className="w-full bg-transparent">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Exportar como Planilha (CSV)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
