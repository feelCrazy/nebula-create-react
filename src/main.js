import chalk from 'chalk'
import path from 'path'
import { promisify } from 'util'
import execa from 'execa'
import Listr from 'listr'
import fs from 'fs-extra'
const execSync = require('child_process').execSync

const access = promisify(fs.access)

// 复制模版文件
async function copyTemptaleFiles(options) {
  await fs.copy(options.templateDirectory, options.targetDirectory, {
    // clobber: false
  })
  return changePackageName(options)
}

// 初始化git
async function initGit(options) {
  const result = await execa('git', ['init'], {
    cwd: options.targetDirectory,
  })
  if (result.failed) {
    return Promise.reject(new Error('Failed to init git'))
  }
  return
}

// 更改项目名称
async function changePackageName(options) {
  const targetPath = path.join(options.targetDirectory, 'package.json')
  const pathName = path.parse(options.targetDirectory)
  const data = await fs.readJSON(targetPath)
  data.name = pathName.name
  return fs.writeFile(targetPath, JSON.stringify(data, null, 2), 'utf8')
}

// 安装依赖
async function installPackage(options) {
  let command = 'npm'
  let args = ['install']
  if (shouldUseYarn()) {
    command = 'yarn'
  }
  const result = await execa(command, args, {
    cwd: options.targetDirectory,
  })
  if (result.failed) {
    return Promise.reject(
      new Error('Error occured while installing dependencies')
    )
  }
  return
}

// 判断是否安装yarn
function shouldUseYarn() {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}

export async function createProject(options) {
  options = {
    ...options,
    targetDirectory: options.targetDirectory || process.cwd(),
  }

  const templateDir = path.resolve(
    __dirname,
    '../templates',
    options.template.toLowerCase()
  )

  options.templateDirectory = templateDir

  try {
    await access(templateDir, fs.constants.R_OK)
  } catch (error) {
    console.error('%s Invalid template name!', chalk.red.bold('ERROR'))
    process.exit(1)
  }

  const tasks = new Listr([
    {
      title: 'Copy project files...',
      task: () => {
        copyTemptaleFiles(options)
      },
    },
    {
      title: 'Initialized a git repository...',
      task: () => initGit(options),
      enabled: () => options.git,
    },
    {
      title: 'Automatically intall dependencies...',
      task: () => installPackage(options),
    },
  ])

  await tasks.run()
  console.log('%s Project ready', chalk.green.bold('Success!'))
  return true
}
