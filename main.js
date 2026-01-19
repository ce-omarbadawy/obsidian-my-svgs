const {
  Plugin,
  addIcon,
  Notice,
  normalizePath,
  Setting,
  PluginSettingTab,
} = require("obsidian");

module.exports = class SvgIconsPlugin extends Plugin {
  settings = {
    iconPrefix: "my-",
  };

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new SvgIconsSettingTab(this.app, this));

    await this.loadPluginIcons();
  }

  async loadPluginIcons() {
    try {
      const iconsPath = normalizePath(`${this.manifest.dir}/icons`);

      const dirExists = await this.app.vault.adapter.exists(iconsPath);
      if (!dirExists) {
        console.log(`Icons directory does not exist: ${iconsPath}`);
        return;
      }

      const files = await this.app.vault.adapter.list(iconsPath);

      const svgFiles = files.files.filter((file) => file.endsWith(".svg"));

      if (svgFiles.length === 0) {
        console.log(`No SVG files found in: ${iconsPath}`);
        return;
      }

      for (const filePath of svgFiles) {
        try {
          const content = await this.app.vault.adapter.read(filePath);

          const fileName = filePath.split("/").pop().replace(".svg", "");

          const iconName = `${this.settings.iconPrefix}${fileName}`;

          const processedSvg = this.processSvg(content);
          addIcon(iconName, processedSvg);
        } catch (error) {
          console.error(`Failed to load icon from ${filePath}:`, error);
        }
      }
    } catch (error) {
      console.error("Error loading plugin icons:", error);
    }
  }

  processSvg(svgContent) {
    let processed = svgContent
      .replace(/<\?xml.*?\?>/g, "")
      .replace(/<!--.*?-->/gs, "")
      .replace(/<!DOCTYPE.*?>/gs, "");

    if (!processed.includes('xmlns="http://www.w3.org/2000/svg"')) {
      processed = processed.replace(
        "<svg",
        '<svg xmlns="http://www.w3.org/2000/svg"',
      );
    }

    processed = processed.replace(/style="([^"]*)"/g, (match, styleContent) => {
      let newStyle = styleContent;
      let attributes = "";

      if (styleContent.includes("fill:")) {
        const fillMatch = styleContent.match(/fill:\s*([^;]+);?/);
        if (fillMatch && fillMatch[1].startsWith("#")) {
          attributes += ` fill="${fillMatch[1]}"`;
          newStyle = newStyle.replace(/fill:\s*[^;]+;?/, "");
        }
      }

      if (styleContent.includes("stroke:")) {
        const strokeMatch = styleContent.match(/stroke:\s*([^;]+);?/);
        if (strokeMatch && strokeMatch[1].startsWith("#")) {
          attributes += ` stroke="${strokeMatch[1]}"`;
          newStyle = newStyle.replace(/stroke:\s*[^;]+;?/, "");
        }
      }

      newStyle = newStyle.replace(/;$/, "").trim();

      if (newStyle) {
        return `style="${newStyle}"${attributes}`;
      } else {
        return attributes;
      }
    });

    processed = processed
      .replace(/fill="black"/g, 'fill="currentColor"')
      .replace(/stroke="black"/g, 'stroke="currentColor"')
      .replace(/fill="#000"/g, 'fill="currentColor"')
      .replace(/stroke="#000"/g, 'stroke="currentColor"')
      .replace(/fill="#000000"/g, 'fill="currentColor"')
      .replace(/stroke="#000000"/g, 'stroke="currentColor"');

    if (processed.includes("viewBox=")) {
      const viewBoxMatch = processed.match(/viewBox="([^"]+)"/);
      if (viewBoxMatch) {
        const viewBoxParts = viewBoxMatch[1].split(/\s+/);
        if (viewBoxParts.length === 4) {
          const [x, y, width, height] = viewBoxParts;
          if (x !== "0" || y !== "0") {
            processed = processed.replace(
              /viewBox="[^"]+"/,
              `viewBox="0 0 ${width} ${height}"`,
            );
          }
        }
      }
    } else {
      const sizeMatch = processed.match(/width="([^"]+)" height="([^"]+)"/);
      if (sizeMatch) {
        const width = sizeMatch[1].replace("px", "");
        const height = sizeMatch[2].replace("px", "");
        processed = processed.replace(
          "<svg",
          `<svg viewBox="0 0 ${width} ${height}"`,
        );
      } else {
        processed = processed.replace("<svg", '<svg viewBox="0 0 24 24"');
      }
    }

    processed = processed
      .replace(/\s+width="[^"]*"/g, "")
      .replace(/\s+height="[^"]*"/g, "");

    processed = processed.replace(/\s+display="none"/g, "");

    return processed;
  }

  processSvgForPreview(svgContent) {
    let processed = svgContent
      .replace(/<\?xml.*?\?>/g, "")
      .replace(/<!--.*?-->/gs, "")
      .replace(/<!DOCTYPE.*?>/gs, "");

    if (!processed.includes('xmlns="http://www.w3.org/2000/svg"')) {
      processed = processed.replace(
        "<svg",
        '<svg xmlns="http://www.w3.org/2000/svg"',
      );
    }

    processed = processed.replace(/style="([^"]*)"/g, (match, styleContent) => {
      let newStyle = styleContent;
      let attributes = "";

      if (styleContent.includes("fill:")) {
        const fillMatch = styleContent.match(/fill:\s*([^;]+);?/);
        if (fillMatch && fillMatch[1].startsWith("#")) {
          attributes += ` fill="${fillMatch[1]}"`;
          newStyle = newStyle.replace(/fill:\s*[^;]+;?/, "");
        }
      }

      if (styleContent.includes("stroke:")) {
        const strokeMatch = styleContent.match(/stroke:\s*([^;]+);?/);
        if (strokeMatch && strokeMatch[1].startsWith("#")) {
          attributes += ` stroke="${strokeMatch[1]}"`;
          newStyle = newStyle.replace(/stroke:\s*[^;]+;?/, "");
        }
      }

      newStyle = newStyle.replace(/;$/, "").trim();

      if (newStyle) {
        return `style="${newStyle}"${attributes}`;
      } else {
        return attributes;
      }
    });

    if (processed.includes("viewBox=")) {
      const viewBoxMatch = processed.match(/viewBox="([^"]+)"/);
      if (viewBoxMatch) {
        const viewBoxParts = viewBoxMatch[1].split(/\s+/);
        if (viewBoxParts.length === 4) {
          const [x, y, width, height] = viewBoxParts;

          if (x !== "0" || y !== "0") {
            processed = processed.replace(
              /viewBox="[^"]+"/,
              `viewBox="0 0 ${width} ${height}"`,
            );
          }
        }
      }
    } else {
      const sizeMatch = processed.match(/width="([^"]+)" height="([^"]+)"/);
      if (sizeMatch) {
        const width = sizeMatch[1].replace("px", "");
        const height = sizeMatch[2].replace("px", "");
        processed = processed.replace(
          "<svg",
          `<svg viewBox="0 0 ${width} ${height}"`,
        );
      } else {
        processed = processed.replace("<svg", '<svg viewBox="0 0 24 24"');
      }
    }

    processed = processed
      .replace(/\s+width="[^"]*"/g, "")
      .replace(/\s+height="[^"]*"/g, "");

    return processed;
  }

  async loadSettings() {
    this.settings = Object.assign({}, this.settings, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async reloadIcons() {
    new Notice("Reloading My SVGs...");
    try {
      await this.loadPluginIcons();
      new Notice(`My SVGs reloaded! Check console for details.`);
    } catch (error) {
      new Notice("Failed to reload My SVGs. Check console for errors.");
      console.error("Reload error:", error);
    }
  }

  onunload() {}
};

class SvgIconsSettingTab extends PluginSettingTab {
  plugin;
  gridContainer;

  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.addClass("my-svgs-plugin");

    new Setting(containerEl)
      .setName("Icon prefix")
      .setDesc(
        "Prefix for all loaded SVG icons (e.g., 'my-' becomes 'my-filename')",
      )
      .addText((text) =>
        text
          .setPlaceholder("my-")
          .setValue(this.plugin.settings.iconPrefix)
          .onChange(async (value) => {
            this.plugin.settings.iconPrefix = value;
            await this.plugin.saveSettings();
          }),
      );

    const instructionsSection = containerEl.createEl("div", {
      cls: "my-svgs-instructions-section",
    });

    new Setting(instructionsSection).setHeading().setName("Instructions");

    const instructions = instructionsSection.createEl("div", {
      cls: "my-svgs-setting-item-description",
    });

    const addInstructionsHeading = (text) => {
      instructions.createEl("div", {
        cls: "my-svgs-setting-item-description",
        text: text,
      });
    };

    addInstructionsHeading("How to add your custom SVG icons:");
    const list1 = instructions.createEl("ol");
    list1.createEl("li", {
      text: "Find your Obsidian vault folder on your device",
    });
    list1.createEl("li", {
      text: "Navigate to the hidden .obsidian folder inside your vault",
    });
    list1.createEl("li", {
      text: "Go to .obsidian/plugins/my-svgs/icons/ folder (create the icons folder if it doesn't exist)",
    });
    list1.createEl("li", { text: "Copy your SVG files into this folder" });
    list1.createEl("li", {
      text: 'Click the "Reload Now" button to load your new icons',
    });

    addInstructionsHeading("How to use your icons:");
    const list2 = instructions.createEl("ol");
    list2.createEl("li", {
      text: "Your icons will appear in the grid below after reloading",
    });
    list2.createEl("li", {
      text: `Each icon will be named as ${this.plugin.settings.iconPrefix}filename (example: if your file is home.svg, the icon will be ${this.plugin.settings.iconPrefix}home)`,
    });
    list2.createEl("li", { text: "Use the search box to find specific icons" });
    list2.createEl("li", {
      text: "Click the copy button on any icon to copy its name for use in your notes",
    });
    list2.createEl("li", {
      text: 'If you don\'t see your icons, click the "Reload Now" button above the grid',
    });

    const tipContainer = instructions.createEl("div", {
      cls: "my-svgs-setting-item-description my-svgs-tip",
    });
    tipContainer.createEl("strong", { text: "💡 Tip:" });
    tipContainer.createSpan({
      text: ' Can\'t find the .obsidian folder? It might be hidden. On Windows, enable "Show hidden files" in File Explorer. On Mac/Linux, press Cmd+Shift+. (dot) or Ctrl+H to show hidden files.',
    });

    new Setting(containerEl)
      .setName("Reload icons")
      .setDesc("Manually reload all SVG icons from the icons folder")
      .addButton((button) =>
        button
          .setButtonText("Reload now")
          .setCta()
          .onClick(async () => {
            await this.plugin.reloadIcons();
            this.gridContainer.empty();
            this.displayIconsGrid(this.gridContainer);
          }),
      );

    const gridSection = containerEl.createEl("div", {
      cls: "my-svgs-grid-section",
    });
    const gridContainer = gridSection.createEl("div", {
      cls: "my-svgs-grid-wrapper",
    });
    this.gridContainer = gridContainer;

    this.displayIconsGrid(gridContainer);
  }

  async displayIconsGrid(container) {
    try {
      const iconsPath = normalizePath(`${this.plugin.manifest.dir}/icons`);

      const dirExists = await this.app.vault.adapter.exists(iconsPath);
      if (!dirExists) {
        const errorMsg = container.createEl("div", {
          cls: "my-svgs-no-icons-message",
        });
        errorMsg.createEl("p", {
          text: `Icons directory not found: ${iconsPath}`,
        });
        errorMsg.createEl("p", {
          text: "Please ensure the icons folder exists and contains SVG files.",
        });
        return;
      }

      const files = await this.app.vault.adapter.list(iconsPath);
      const svgFiles = files.files.filter((file) => file.endsWith(".svg"));

      if (svgFiles.length === 0) {
        const errorMsg = container.createEl("div", {
          cls: "my-svgs-no-icons-message",
        });
        errorMsg.createEl("p", {
          text: "No SVG files found in the icons folder.",
        });
        errorMsg.createEl("p", {
          text: `Add some SVG files to ${iconsPath} and reload.`,
        });
        return;
      }

      const header = container.createEl("div", { cls: "my-svgs-grid-header" });

      const titleRow = header.createEl("div", { cls: "my-svgs-title-row" });
      titleRow.createEl("h4", {
        cls: "my-svgs-grid-title",
        text: "Available SVGs",
      });

      const rightSection = titleRow.createEl("div", {
        cls: "my-svgs-title-right",
      });
      const countBadge = rightSection.createEl("span", {
        cls: "my-svgs-icon-count",
        text: `${svgFiles.length} icons`,
      });

      const searchContainer = header.createEl("div", {
        cls: "my-svgs-search-container",
      });
      const searchInput = searchContainer.createEl("input", {
        type: "text",
        placeholder: "Search icons...",
        cls: "my-svgs-icon-search-input",
      });

      const clearBtn = searchContainer.createEl("button", {
        cls: "my-svgs-clear-search-btn",
        text: "✕",
        title: "Clear search",
      });
      clearBtn.setAttribute("data-hidden", "true");

      const grid = container.createEl("div", { cls: "my-svgs-icons-grid" });

      const allIconCards = [];

      const filterIcons = (searchTerm) => {
        const term = searchTerm.toLowerCase().trim();
        let visibleCount = 0;

        allIconCards.forEach((card) => {
          const iconName = card
            .querySelector(".my-svgs-icon-name")
            .textContent.toLowerCase();
          const isVisible = iconName.includes(term);

          card.setAttribute("data-hidden", isVisible ? "false" : "true");
          if (isVisible) visibleCount++;
        });

        countBadge.textContent = term
          ? `${visibleCount} of ${svgFiles.length} icons`
          : `${svgFiles.length} icons`;

        clearBtn.setAttribute("data-hidden", term ? "false" : "true");
      };

      searchInput.addEventListener("input", (e) => {
        filterIcons(e.target.value);
      });

      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        filterIcons("");
        searchInput.focus();
      });

      for (const filePath of svgFiles) {
        try {
          const fileName = filePath.split("/").pop().replace(".svg", "");
          const iconName = `${this.plugin.settings.iconPrefix}${fileName}`;

          const card = grid.createEl("div", { cls: "my-svgs-icon-card" });
          allIconCards.push(card);

          const preview = card.createEl("div", { cls: "my-svgs-icon-preview" });

          try {
            const svgContent = await this.app.vault.adapter.read(filePath);
            const processedSvg = this.plugin.processSvgForPreview(svgContent);
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(processedSvg, "text/html");
            const svgElement = svgDoc.body.firstChild;
            if (svgElement) {
              preview.appendChild(svgElement);
            }
          } catch (error) {
            console.error(`Failed to read SVG ${filePath}:`, error);
            preview.createEl("div", { text: "📄" });
          }

          const nameEl = card.createEl("div", {
            cls: "my-svgs-icon-name",
            text: iconName,
          });

          const copyBtn = card.createEl("button", {
            cls: "my-svgs-copy-button",
            text: "Copy",
          });

          copyBtn.addEventListener("click", () => {
            navigator.clipboard
              .writeText(iconName)
              .then(() => {
                new Notice(`Copied: ${iconName}`);
              })
              .catch(() => {
                const textArea = document.createElement("textarea");
                textArea.value = iconName;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
                new Notice(`Copied: ${iconName}`);
              });
          });
        } catch (error) {
          console.error(`Failed to process icon ${filePath}:`, error);

          const errorCard = grid.createEl("div", {
            cls: "my-svgs-icon-card my-svgs-error",
          });
          errorCard.createEl("div", {
            cls: "my-svgs-icon-preview",
            text: "❌",
          });
          errorCard.createEl("div", {
            cls: "my-svgs-icon-name",
            text: `Error loading ${fileName}`,
          });
        }
      }
    } catch (error) {
      console.error("Error displaying icons grid:", error);
      const errorMsg = container.createEl("div", {
        cls: "my-svgs-error-message",
      });
      errorMsg.createEl("p", {
        text: `Error loading icons: ${error.message}`,
      });
    }
  }
}
