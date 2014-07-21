/**
 * Simple wrapper around ACE editor
 */
class SourceEditor extends qx.ui.core.Widget {

    private aceEditor:Ace.Editor;
    private popup:qx.ui.popup.Popup;
    private autoCompleteView: Cats.UI.AutoCompleteView;

    constructor(private session:Cats.AceSession) {
        super();
        this.addListenerOnce("appear", () => {
            var container = this.getContentElement().getDomElement();
            // create the editor
            this.aceEditor = this.createAceEditor(container);
            this.aceEditor.getSession().setMode("ace/mode/typescript");
            // this.aceEditor.getSession().setValue(this.getContent());
            this.aceEditor.getSession();
            this.setContent(session.getValue());
            this.addListener("resize", () => {
                // use a timeout to let the layout queue apply its changes to the dom
                window.setTimeout(() => {
                    this.aceEditor.resize();
                }, 0);
            });
            this.autoCompleteView = new Cats.UI.AutoCompleteView(this.aceEditor);
             // this.setupInputHandling();
              if (session.mode === "typescript") this.createContextMenu();
        }, this);
        
        this.popup = new qx.ui.popup.Popup(new qx.ui.layout.Flow());
        this.popup.add(new qx.ui.basic.Label("Code completion"));
    }

    getSession() : Cats.Session {
        return this.session;
    }
    
    getAceEditor() {
        return this.aceEditor;
    }


     autoComplete() {
            if (this.session.mode === "typescript") {
                var cursor = this.aceEditor.getCursorPosition();
                this.session.autoComplete(cursor, this.autoCompleteView);
            }                        
        }

    autoComplete123() {
        // alert("auto complete");
        var cursor = this.aceEditor.getCursorPosition();
        var coords = this.aceEditor.renderer.textToScreenCoordinates(cursor.row, cursor.column);
        this.popup.moveTo(coords.pageX, coords.pageY);
        this.popup.show();
    }


          // Initialize the editor
        private createAceEditor(rootElement):Ace.Editor {
            var editor: Ace.Editor = ace.edit(rootElement);

            editor.commands.addCommands([
            {
                name: "autoComplete",
                bindKey: {
                    win: "Ctrl-Space",
                    mac: "Ctrl-Space" 
                },
                exec: () => { this.autoComplete() }
            },

           {
                name: "gotoDeclaration",
                bindKey: {
                    win: "F12",
                    mac: "F12"
                },
                exec: () => { Cats.Commands.runCommand(Cats.Commands.CMDS.navigate_declaration) }
            },


            {
                name: "save",
                bindKey: {
                    win: "Ctrl-S",
                    mac: "Command-S"
                },
                exec: () =>  { Cats.Commands.runCommand(Cats.Commands.CMDS.file_save) }
            }
            ]);
 
            var originalTextInput = editor.onTextInput;
            editor.onTextInput = (text) => {
                originalTextInput.call(editor, text);
                if (text === ".") this.autoComplete();
            };

            /*
            var elem = rootElement; // TODo find scroller child
            elem.onmousemove = this.onMouseMove.bind(this);
            elem.onmouseout = () => {
                this.toolTip.hide()
                clearTimeout(this.mouseMoveTimer);
            };
            */

            return editor;
    }

    setContent(value:string) {
        this.aceEditor.getSession().setValue(value);
    }
    
    private createContextMenuItem(name, commandID) {
        var button = new qx.ui.menu.Button(name);
        var command = Cats.Commands.get(commandID).command;
        button.addListener("execute", () =>{
           command();
        });
        return button;
    }
    
    private createContextMenu() {
        var CMDS = Cats.Commands.CMDS;
        var menu = new qx.ui.menu.Menu();
    
        menu.add(this.createContextMenuItem("Goto Declaration", CMDS.navigate_declaration));
        menu.add(this.createContextMenuItem("Find References", CMDS.navigate_references));
        menu.add(this.createContextMenuItem("Find Occurences", CMDS.navigate_occurences));
        menu.add(this.createContextMenuItem("FInd Implementations", CMDS.navigate_implementors));
        
        this.setContextMenu(menu);
    }
  


}