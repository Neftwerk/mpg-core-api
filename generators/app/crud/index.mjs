import { camelCase, constantCase, kebabCase, pascalCase } from 'change-case';
import Generator from 'yeoman-generator';

import { buildTemplateUrls } from './helpers/build-template-urls.mjs';

export default class extends Generator {
  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter the name of the module (for example: user-ticket):',
        default: 'example-module',
      },
    ]);
  }

  writing() {
    const userInputName = kebabCase(this.answers.name);
    const moduleName = pascalCase(userInputName);
    const modulePath = this.destinationPath(`src/module/${userInputName}`);
    const baseParams = {
      name: userInputName,
      moduleName,
      pascalCase,
      kebabCase,
      camelCase,
      constantCase,
    };

    const copyTemplate = (templatePath, destinationPath) => {
      this.fs.copyTpl(
        this.templatePath(templatePath),
        this.destinationPath(destinationPath),
        baseParams,
      );
    };

    const templates = buildTemplateUrls(modulePath, userInputName);

    templates.forEach(({ template, destination }) =>
      copyTemplate(template, destination),
    );

    this._addModuleToAppModule(moduleName, userInputName);
  }

  _addModuleToAppModule(moduleName, modulePath) {
    const appModulePath = this.destinationPath('src/module/app/app.module.ts');
    if (!this.fs.exists(appModulePath)) return;

    const moduleFileName = `${kebabCase(moduleName)}.module`;
    const moduleSpecifier = `@/module/${modulePath}/${moduleFileName}`;
    const importStatement = `import { ${moduleName}Module } from '${moduleSpecifier}';\n`;
    const newModuleInImports = `${moduleName}Module`;

    let appModuleContent = this.fs.read(appModulePath);

    if (!appModuleContent.includes(moduleSpecifier)) {
      const firstDecoratorIndex = appModuleContent.search(/@(?:Module|Global)/);
      if (firstDecoratorIndex !== -1) {
        appModuleContent =
          appModuleContent.slice(0, firstDecoratorIndex) +
          importStatement +
          appModuleContent.slice(firstDecoratorIndex);
      } else {
        const lastImportIndex = appModuleContent.lastIndexOf('import ');
        const endOfLastImport =
          appModuleContent.indexOf(';', lastImportIndex) + 1;
        appModuleContent =
          appModuleContent.slice(0, endOfLastImport) +
          '\n' +
          importStatement +
          appModuleContent.slice(endOfLastImport);
      }
    }

    const lines = appModuleContent.split('\n');
    let insideRootImportsArray = false;
    let insideConfigModule = false;
    let indent = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('imports: [')) {
        insideRootImportsArray = true;
        indent = line.match(/^\s*/)[0];
        continue;
      }

      if (insideRootImportsArray && line.trim() === '],') {
        insideRootImportsArray = false;
        lines.splice(i, 0, `${indent}  ${newModuleInImports},`);
        break;
      }

      if (line.includes('ConfigModule.forRoot')) {
        insideConfigModule = true;
      }

      if (insideConfigModule && line.includes('}),')) {
        insideConfigModule = false;
      }

      if (insideConfigModule) {
        continue;
      }
    }

    appModuleContent = lines.join('\n');

    this.fs.write(appModulePath, appModuleContent);
  }

  coloredLogger(message, color) {
    const logger = this.env.adapter.log;
    logger.colored([
      {
        message,
        color,
      },
    ]);
  }
}
