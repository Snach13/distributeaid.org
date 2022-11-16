import { CreateNodeArgs, CreateSchemaCustomizationArgs } from 'gatsby'
import minimatch from 'minimatch'
import path from 'path'
import { PhotoData } from '../../src/types/photo.d'
import { derivePhoto } from '../photos/photos'
import { getObjectProperty } from '../utils/untypedAccess/getObjectProperty'
import { getStringProperty } from '../utils/untypedAccess/getStringProperty'
import { nodeParent } from '../utils/untypedAccess/nodeParent'

export const createFundraiserSchemaCustomization = ({
  actions: { createTypes },
}: CreateSchemaCustomizationArgs) => {
  const typeDefs = `
    type DAFundraiser implements Node {
      name: String!
      title: String!
      donateUrl: String!
      gallery: [DAPhoto!]!
      target: Int!
      totalAllocated: Int!
      allocations: [DAFundraiserAllocation!]!
      body: String!
    }

    type DAFundraiserAllocation {
      date: Date!
      amountEUR: Int!
      purpose: String!
    }
  `
  createTypes(typeDefs)
}

/**
 * Creates the fundraiser nodes
 */
export const createFundraisersFromMarkdown = (args: CreateNodeArgs) => {
  const {
    node,
    actions: { createNode },
    createNodeId,
    createContentDigest,
    getNode,
  } = args

  if (
    node.internal.type === 'MarkdownRemark' &&
    node.fileAbsolutePath &&
    minimatch(
      getStringProperty(node, 'fileAbsolutePath'),
      '**/content/blocks/fundraisers/*.md',
    )
  ) {
    const fileRelativePath = path.join(
      'content',
      getStringProperty(getNode(nodeParent(node)), 'relativePath'),
    )
    const fileName = path.parse(fileRelativePath).name

    const fm = getObjectProperty(node, 'frontmatter')
    const galleryData = fm.gallery || []
    const gallery = galleryData.map((image: PhotoData) => {
      return derivePhoto(image, node.id, args)
    })
    const totalAllocated = fm.allocations.reduce(
      (total: number, { amountEUR }: { amountEUR: number }) => {
        return total + amountEUR
      },
      0,
    )

    createNode({
      name: fileName,
      title: fm.title,
      donateUrl: fm.donateUrl,
      gallery: gallery,
      target: fm.target,
      totalAllocated,
      allocations: fm.allocations ?? [],
      body: node.rawMarkdownBody,
      fileRelativePath,
      id: createNodeId(`Fundraiser - ${fileName}`),
      parent: node.id,
      children: [],
      internal: {
        type: 'DAFundraiser',
        contentDigest: createContentDigest(fm),
      },
    })
  }
}
