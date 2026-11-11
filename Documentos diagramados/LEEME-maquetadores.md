# Los maquetadores

Scripts en Python que **componen** los documentos diagramados (los PDF, Word y PPT
que luego se replican a OneDrive). Están en Git porque son el código con el que se
regeneran; los documentos que producen, no: ver la sección «Dónde quedan los
documentos generados» del `README.md`.

| Carpeta | Qué compone |
|---|---|
| `Presentaciones/Maquetador (scripts)` | Los `.pptx` editables de aprobación (Referencial y Formularios). |
| `Vida en el Campus diagramado por Tito/Maquetador (scripts)` | El Formulario de Vida en el Campus de **Ed Superior** (ES y PT). |
| `Vida en el Campus diagramado por Tito/Maquetador básica (scripts)` | El mismo formulario para **Ed Básica** (ES y PT); trae su propio juego de fuentes, portadas y los criterios en `crit_es.py` / `crit_pt.py`. |
| `Presentaciones/Fuentes para instalar` | Las fuentes de la identidad (Lato, Montserrat, Niconne). Hay que **instalarlas en el sistema** para editar los `.pptx` sin que se sustituyan. |

## Qué hace falta para correrlos

```bash
pip3 install pymupdf python-docx python-pptx pillow numpy
```

(`import fitz` es PyMuPDF.)

## Insumos que no están en Git

Los maquetadores leen los PDF diagramados por Marquinhos
(`Referencial Gestão Internatos - Ed Básica_Port - Completo.pdf` y su par en español)
para extraer logotipos y portadas. Esos PDF son documentos, así que no se versionan:
se bajan de OneDrive, de
`Comitê de gestão do Internatos DSA/5. Documentos diagramados/Referenciales/Diagramados por Marquinhos`,
y se colocan en `Documentos diagramados/Diagramados por Marquinhos/`.
