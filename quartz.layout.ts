import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import type { FileTrieNode } from "./quartz/util/fileTrie"
import { explorerSort } from "./quartz/util/sort"

const explorerDisplayNames = (node: FileTrieNode): void => {
  if (node.isFolder && node.slug === "projects/oneQ/index") {
    node.displayName = "oneQ"
  }
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [Component.TagWheelScroll()],
  footer: Component.Footer(),
}

export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
          shrink: false,
        },
        { Component: Component.Darkmode(), shrink: false },
        { Component: Component.ReaderMode(), shrink: false },
      ],
    }),
    Component.Explorer({
      mapFn: explorerDisplayNames,
      sortFn: explorerSort,
    }),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
          shrink: false,
        },
        { Component: Component.Darkmode(), shrink: false },
        { Component: Component.ReaderMode(), shrink: false },
      ],
    }),
    Component.Explorer({
      mapFn: explorerDisplayNames,
      sortFn: explorerSort,
    }),
  ],
  right: [Component.DesktopOnly(Component.TableOfContents())],
}
