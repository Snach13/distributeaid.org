import { Photo } from './photo.d'

export type Fundraiser = {
  id: string
  name: string
  title: string
  /**
   * Deep link to the donate page on another platform.
   */
  donateUrl: string
  /**
   * Markdown
   */
  body: string
  /**
   * Image URLs
   */
  gallery: Photo[]
  /**
   * Describes the amount we'd like to allocate to this fundraiser.
   */
  target: number
  /**
   * The sum total of each allocation.
   */
  totalAllocated: number
  /**
   * Describes the funds allocated for this fundraisers.
   */
  allocations: {
    /**
     * The date when the allocation was made.
     */
    date: Date
    /**
     * The allocated amount in EUR
     */
    amountEUR: number
    /**
     * Describes the purpose the allocated funds will be used for.
     */
    purpose: string
  }[]
}
