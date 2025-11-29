/**
 * @typedef {'canva'|'pdf'|'video'|'markdown'|'link'|'starter-code'} ItemKind
 *
 * @typedef {Object} ContentItem
 * @property {string} id
 * @property {string} title
 * @property {ItemKind} kind
 * @property {number} order
 * @property {string=} url
 * @property {boolean=} canEmbed
 * @property {string=} body
 * @property {number=} estMinutes
 * @property {string[]=} tags
 * @property {string[]=} level
 *
 * @typedef {Object} Module
 * @property {string} id
 * @property {string} title
 * @property {number} order
 * @property {string=} summary
 * @property {string[]=} prerequisites
 * @property {ContentItem[]} items
 * @property {string[]=} level
 *
 * @typedef {Object} Collection
 * @property {string} id
 * @property {string} title
 * @property {string=} subtitle
 * @property {number} order
 * @property {string} updatedAt
 * @property {string[]|string=} level
 * @property {Module[]} modules
 *
 * @typedef {{collections: Collection[]}} LibraryData
 */
