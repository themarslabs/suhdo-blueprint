"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Eye, ImagePlus, Save } from "lucide-react"

import { DocContent, DocPanel, DocPanelSection, DocSlugField, DocSwitchRow, DocTitleInput } from "@suhdo/ui/components/app/doc-panel"
import { AppPage, AppPageHeader } from "@suhdo/ui/components/app/app-page"
import { Button } from "@suhdo/ui/components/ui/button"
import { ButtonSpinner } from "@suhdo/ui/components/ui/loading-state"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@suhdo/ui/components/ui/card"
import { Input } from "@suhdo/ui/components/ui/input"
import { Label } from "@suhdo/ui/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@suhdo/ui/components/ui/select"
import { Textarea } from "@suhdo/ui/components/ui/textarea"

export function EditPageShowcase() {
  const [title, setTitle] = React.useState("Recursos")
  const [slug, setSlug] = React.useState("recursos")
  const [published, setPublished] = React.useState(false)
  const [indexable, setIndexable] = React.useState(true)
  const [busy, setBusy] = React.useState(false)

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    window.setTimeout(() => setBusy(false), 900)
  }

  return (
    <AppPage className="min-h-[calc(100svh-4rem)]">
      <AppPageHeader
        title="Editar pagina"
        actions={
          <>
            <Button variant="outline" size="sm" asChild><Link href="/pages"><ArrowLeft />Voltar</Link></Button>
            <Button size="sm" type="submit" form="page-editor" disabled={busy}><ButtonSpinner busy={busy} icon={Save} />{busy ? "Salvando" : "Salvar"}</Button>
          </>
        }
      />
      <form id="page-editor" onSubmit={save} className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <DocContent>
          <div>
            <Label htmlFor="page-title" className="sr-only">Titulo da pagina</Label>
            <DocTitleInput value={title} onChange={setTitle} placeholder="Titulo da pagina" />
            <p className="mt-1 text-xs text-muted-foreground">Pagina de conteudo · editada ha poucos minutos</p>
          </div>

          <Card>
            <CardHeader><CardTitle>Conteudo</CardTitle><CardDescription>Estruture a mensagem principal que sera renderizada no site.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2"><Label htmlFor="headline">Chamada principal</Label><Input id="headline" defaultValue="Tudo para operar seu produto com clareza" /></div>
              <div className="grid gap-2"><Label htmlFor="body">Texto</Label><Textarea id="body" rows={10} defaultValue="Centralize conteudo, identidade e publicacao em um fluxo previsivel para toda a equipe." /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Resumo do conteudo</CardTitle><CardDescription>Uma ou duas frases usadas em listagens e previas desta pagina.</CardDescription></CardHeader>
            <CardContent><Textarea rows={3} className="resize-none" defaultValue="Conheca os recursos que sustentam a operacao de conteudo do Hydrogen." /></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>SEO</CardTitle><CardDescription>Metadados exibidos por buscadores e compartilhamentos.</CardDescription></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2"><Label htmlFor="seo-title">Titulo SEO</Label><Input id="seo-title" defaultValue="Recursos do Hydrogen" /></div>
              <div className="grid gap-2"><Label htmlFor="seo-description">Descricao SEO</Label><Textarea id="seo-description" rows={3} defaultValue="Descubra como o Hydrogen organiza conteudo, paginas e publicacao." /></div>
            </CardContent>
          </Card>
        </DocContent>

        <DocPanel>
          <DocPanelSection title="Publicacao">
            <div className="grid gap-2"><Label htmlFor="page-status" className="text-xs">Status</Label><Select defaultValue="draft"><SelectTrigger id="page-status" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Rascunho</SelectItem><SelectItem value="review">Em revisao</SelectItem><SelectItem value="published">Publicada</SelectItem></SelectContent></Select></div>
            <DocSwitchRow id="page-published" label="Pagina publicada" hint="Disponivel no site publico." checked={published} onChange={setPublished} />
          </DocPanelSection>
          <DocPanelSection title="URL publica"><DocSlugField value={slug} onChange={setSlug} prefix="/@hydrogen/" /></DocPanelSection>
          <DocPanelSection title="Imagem destacada">
            <button type="button" className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"><ImagePlus className="size-5" /><span className="text-xs">Escolher imagem</span></button>
          </DocPanelSection>
          <DocPanelSection title="Descoberta">
            <DocSwitchRow id="page-indexable" label="Indexacao" hint="Buscadores podem listar esta pagina." checked={indexable} onChange={setIndexable} />
            <Button type="button" variant="outline" className="w-full"><Eye />Visualizar pagina</Button>
          </DocPanelSection>
        </DocPanel>
      </form>
    </AppPage>
  )
}
