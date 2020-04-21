import arg from 'arg'
import inquirer from 'inquirer'
import chalk from 'chalk'
import figlet from 'figlet'
import { createProject } from './main'
import pkg from '../package.json'

function outTitle() {
  console.log(
    chalk.green(
      figlet.textSync('create-react', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default'
      })
    )
  )
}

// 解析 命令
function argIntoOptions(rawArgs) {
  const args = arg(
    {
      '--git': Boolean,
      '--yes': Boolean,
      '--help': Boolean,
      '--version': Boolean,
      '-g': '--git',
      '-y': '--yes',
      '-h': '--help',
      '-v': '--version'
    },
    {
      argv: rawArgs.slice('2')
    }
  )
  return {
    skipPrompts: args['--yes'] || false,
    git: args['--git'] || false,
    template: args._[0],
    version: args['--version'] || false
  }
}

// 提示配置
async function promptForMissingOptions(options) {
  const defaultTemplate = 'TypeScript'
  if (options.skipPrompts) {
    return {
      ...options,
      template: options.template || defaultTemplate
    }
  }
  const questions = []
  if (!options.template) {
    questions.push({
      type: 'list',
      name: 'template',
      message: 'Pleast choose whice project template to use',
      choices: ['TypeScript', 'JavaScript'],
      default: defaultTemplate
    })
  }
  if (!options.git) {
    questions.push({
      type: 'confirm',
      name: 'git',
      message: 'Init a git repository',
      default: false
    })
  }
  if (options.version) {
    console.log(chalk.green.bold('version:'), pkg.version)
    process.exit(1)
  }

  const answers = await inquirer.prompt(questions)
  return {
    ...options,
    template: options.template || answers.template,
    git: options.git || answers.git
  }
}

export async function cli(params) {
  outTitle()
  try {
    let options = argIntoOptions(params)
    options = await promptForMissingOptions(options)
    await createProject(options)
  } catch (error) {
    console.log('%s Invalid option', chalk.red.bold('ERROR'))
  }
}
