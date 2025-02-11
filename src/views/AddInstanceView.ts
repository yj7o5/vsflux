import * as vscode from 'vscode'
import * as path from 'path'
import { View } from './View'
import { InfluxDBTreeProvider } from './TreeView'
import { IInstance, InfluxVersion } from '../types'

import * as Mustache from 'mustache'

function getConfig() : vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration('vsflux')
}

function defaultV1URL() : string {
    return getConfig()?.get<string>('defaultInfluxDBV1URL', '')
}

function defaultV2URLList() : string[] {
    return getConfig()?.get<string[]>('defaultInfluxDBURLs', [''])
}

export class InstanceView extends View {
    // XXX: rockstar (25 Aug 2021) - This shouldn't take a reference to the tree,
    // but does currently because the tree is the "controller" for this web view.
    public constructor(
        context : vscode.ExtensionContext,
        private tree : InfluxDBTreeProvider
    ) {
        super(context, 'templates/editConn.html')
    }

    public async edit(
        conn : IInstance
    ) : Promise<void> {
        return this.show('Edit Connection', conn)
    }

    public async create() : Promise<void> {
        return this.show('New Connection')
    }

    private async show(
        title : string,
        conn ?: IInstance | undefined
    ) : Promise<void> {
        const panel = vscode.window.createWebviewPanel(
            'InfluxDB',
            title,
            vscode.ViewColumn.Active,
            {
                enableScripts: true,
                enableCommandUris: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(this.context.extensionPath, 'templates'))
                ],
                retainContextWhenHidden: true
            }
        )

        panel.webview.html = await this.html(conn, {
            cssPath: this.cssPath,
            jsPath: this.jsPath,
            title
        })

        await this.tree.setMessageHandler(panel)
    }

    private get cssPath() : vscode.Uri {
        return vscode.Uri.file(
            path.join(this.context.extensionPath, 'templates', 'form.css')
        ).with({ scheme: 'vscode-resource' })
    }

    private get jsPath() : vscode.Uri {
        return vscode.Uri.file(
            path.join(this.context.extensionPath, 'templates', 'editConn.js')
        ).with({ scheme: 'vscode-resource' })
    }

    private async html(
        conn : IInstance | undefined,
        params : { cssPath : vscode.Uri; jsPath : vscode.Uri; title : string }
    ) : Promise<string> {
        const context = {
            ...conn,
            ...params,
            isV1: false,
            defaultHostV1: defaultV1URL(),
            defaultHostLists: defaultV2URLList()

        }
        if (conn !== undefined) {
            context.isV1 = conn.version === InfluxVersion.V1
        }
        return Mustache.render(this.template, context)
    }
}
