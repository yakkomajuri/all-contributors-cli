const _ = require('lodash/fp')
const formatBadge = require('./format-badge')
const formatContributor = require('./format-contributor')

function injectListBetweenTags(newContent) {
  return function(previousContent) {
    const tagToLookFor = `<!-- ALL-CONTRIBUTORS-LIST:`
    const closingTag = '-->'
    const startOfOpeningTagIndex = previousContent.indexOf(
      `${tagToLookFor}START`,
    )
    const endOfOpeningTagIndex = previousContent.indexOf(
      closingTag,
      startOfOpeningTagIndex,
    )
    const startOfClosingTagIndex = previousContent.indexOf(
      `${tagToLookFor}END`,
      endOfOpeningTagIndex,
    )
    if (
      startOfOpeningTagIndex === -1 ||
      endOfOpeningTagIndex === -1 ||
      startOfClosingTagIndex === -1
    ) {
      return previousContent
    }
    return [
      previousContent.slice(0, endOfOpeningTagIndex + closingTag.length),
      '\n<!-- prettier-ignore-start -->',
      '\n<!-- markdownlint-disable -->',
      newContent,
      '<!-- markdownlint-restore -->',
      '\n<!-- prettier-ignore-end -->',
      '\n\n',
      previousContent.slice(startOfClosingTagIndex),
    ].join('')
  }
}

function formatLine(contributors) {
  return `${contributors.join(' ')}`
}

function generateContributorsList(options, contributors) {
  return _.flow(
    _.sortBy(contributor => {
      if (options.contributorsSortAlphabetically) {
        return contributor.name
      }
    }),
    _.map(function formatEveryContributor(contributor) {
      return formatContributor(options, contributor)
    }),
    _.chunk(options.contributorsPerLine),
    _.map(formatLine),
    _.join(' '),
    newContent => {
      return `\n ${newContent}\n`
    },
  )(contributors)
}

function replaceBadge(newContent) {
  return function(previousContent) {
    const tagToLookFor = `<!-- ALL-CONTRIBUTORS-BADGE:`
    const closingTag = '-->'
    const startOfOpeningTagIndex = previousContent.indexOf(
      `${tagToLookFor}START`,
    )
    const endOfOpeningTagIndex = previousContent.indexOf(
      closingTag,
      startOfOpeningTagIndex,
    )
    const startOfClosingTagIndex = previousContent.indexOf(
      `${tagToLookFor}END`,
      endOfOpeningTagIndex,
    )
    if (
      startOfOpeningTagIndex === -1 ||
      endOfOpeningTagIndex === -1 ||
      startOfClosingTagIndex === -1
    ) {
      return previousContent
    }
    return [
      previousContent.slice(0, endOfOpeningTagIndex + closingTag.length),
      '\n',
      newContent,
      '\n',
      previousContent.slice(startOfClosingTagIndex),
    ].join('')
  }
}

module.exports = function generate(options, contributors, fileContent) {
  const contributorsList =
    contributors.length === 0
      ? '\n'
      : generateContributorsList(options, contributors)
  const badge = formatBadge(options, contributors)
  return _.flow(
    injectListBetweenTags(contributorsList),
    replaceBadge(badge),
  )(fileContent)
}
