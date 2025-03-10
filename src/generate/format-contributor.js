const _ = require('lodash/fp')
const formatContributionType = require('./format-contribution-type')

const avatarTemplate = _.template(
  '<img src="<%= contributor.avatar_url %>" width="50" height="50" alt=""/>',
)
const avatarBlockTemplate = _.template(
  '<a href="<%= contributor.profile %>"><%= avatar %></a>',
)

const avatarBlockTemplateNoProfile = _.template(
  '<%= avatar %>',
)
const contributorTemplate = _.template(
  '<%= avatarBlock %>',
)

const defaultImageSize = 100

function defaultTemplate(templateData) {
  const name = escapeName(templateData.contributor.name)
  const avatar = avatarTemplate(
    _.assign(templateData, {
      name,
    }),
  )
  const avatarBlockTemplateData = _.assign(
    {
      name,
      avatar,
    },
    templateData,
  )
  let avatarBlock = null

  if (templateData.contributor.profile) {
    avatarBlock = avatarBlockTemplate(avatarBlockTemplateData)
  } else {
    avatarBlock = avatarBlockTemplateNoProfile(avatarBlockTemplateData)
  }

  return contributorTemplate(_.assign({avatarBlock}, templateData))
}

function escapeName(name) {
  return name.replace(new RegExp('\\|', 'g'), '&#124;')
}

module.exports = function formatContributor(options, contributor) {
  const formatter = _.partial(formatContributionType, [options, contributor])
  const contributions = contributor.contributions.map(formatter).join(' ')
  const templateData = {
    contributions,
    contributor,
    options: _.assign({imageSize: defaultImageSize}, options),
  }
  const customTemplate =
    options.contributorTemplate && _.template(options.contributorTemplate)
  return (customTemplate || defaultTemplate)(templateData)
}
