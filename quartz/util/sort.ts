import type { Options } from "../components/Explorer"

type ExplorerSortFn = NonNullable<Options["sortFn"]>
type ExplorerSortNode = Parameters<ExplorerSortFn>[0]

export function explorerSort(a: ExplorerSortNode, b: ExplorerSortNode): number {
  if (a.isFolder && !b.isFolder) return -1
  if (!a.isFolder && b.isFolder) return 1

  const aSource = a.slug ?? a.data?.slug ?? a.displayName ?? ""
  const bSource = b.slug ?? b.data?.slug ?? b.displayName ?? ""

  const aNormalized = aSource.replace(/\/index$/, "")
  const bNormalized = bSource.replace(/\/index$/, "")

  const aFilename = aNormalized.split("/").pop() ?? aNormalized
  const bFilename = bNormalized.split("/").pop() ?? bNormalized

  const aMatch = aFilename.match(/^(\d+)[-_]/)
  const bMatch = bFilename.match(/^(\d+)[-_]/)

  const aOrder = aMatch ? Number.parseInt(aMatch[1], 10) : Number.POSITIVE_INFINITY
  const bOrder = bMatch ? Number.parseInt(bMatch[1], 10) : Number.POSITIVE_INFINITY

  if (aOrder !== bOrder) {
    return aOrder - bOrder
  }

  return a.displayName.localeCompare(b.displayName, undefined, {
    numeric: true,
    sensitivity: "base",
  })
}
