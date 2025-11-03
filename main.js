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
    showReloadButton: true,
    hasShownLoadedNotice: false,
  };

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new SvgIconsSettingTab(this.app, this));

    if (this.settings.showReloadButton) {
      this.addRibbonIcon("refresh-cw", "Reload My SVGs", async () => {
        await this.reloadIcons();
      });
    }

    await this.loadPluginIcons();

    if (!this.settings.hasShownLoadedNotice) {
      new Notice("My SVGs plugin loaded");
      this.settings.hasShownLoadedNotice = true;
      try {
        await this.saveSettings();
      } catch (e) {
        console.error("Failed to save settings after showing initial notice:", e);
      }
    }
  }

  async loadPluginIcons() {
    try {
      const iconsPath = normalizePath(
        `${this.app.vault.configDir}/plugins/${this.manifest.id}/icons`
      );

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
        '<svg xmlns="http://www.w3.org/2000/svg"'
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
              `viewBox="0 0 ${width} ${height}"`
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
          `<svg viewBox="0 0 ${width} ${height}"`
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
        '<svg xmlns="http://www.w3.org/2000/svg"'
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
              `viewBox="0 0 ${width} ${height}"`
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
          `<svg viewBox="0 0 ${width} ${height}"`
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

  onunload() {
    console.log("Unloading My SVGs plugin");
  }
};

class SvgIconsSettingTab extends PluginSettingTab {
  plugin;

  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "My SVGs Settings" });

    new Setting(containerEl)
      .setName("Icon Prefix")
      .setDesc(
        "Prefix for all loaded SVG icons (e.g., 'my-' becomes 'my-filename')"
      )
      .addText((text) =>
        text
          .setPlaceholder("my-")
          .setValue(this.plugin.settings.iconPrefix)
          .onChange(async (value) => {
            this.plugin.settings.iconPrefix = value;
            await this.plugin.saveSettings();
          })
      );

    const instructionsSection = containerEl.createEl("div", {
      cls: "instructions-section",
    });
    instructionsSection.createEl("h3", { text: "Instructions" });
    const instructions = instructionsSection.createEl("div", {
      cls: "setting-item-description",
    });
    instructions.innerHTML = `
      <div class="setting-item-description" style="margin-bottom: 1em;">
        How to add your custom SVG icons:
      </div>
      <ol>
        <li>Find your Obsidian vault folder on your computer</li>
        <li>Navigate to the hidden <code>.obsidian</code> folder inside your vault</li>
        <li>Go to <code>.obsidian/plugins/my-svgs/icons/</code> folder (create the <code>icons</code> folder if it doesn't exist)</li>
        <li>Copy your SVG files into this folder</li>
        <li>Click the "Reload Now" button below to load your new icons</li>
      </ol>
      <div class="setting-item-description" style="margin-top: 1em;">
        How to use your icons:
      </div>
      <ol>
        <li>Your icons will appear in the grid below after reloading</li>
        <li>Each icon will be named as <code>${this.plugin.settings.iconPrefix}filename</code> (example: if your file is <code>home.svg</code>, the icon will be <code>${this.plugin.settings.iconPrefix}home</code>)</li>
        <li>Use the search box to find specific icons</li>
        <li>Click the copy button on any icon to copy its name for use in your notes</li>
        <li>If you don't see your icons, click the refresh button (🔄) above the grid</li>
      </ol>
      <div class="setting-item-description" style="margin-top: 1em; color: var(--text-muted);">
        💡 Tip: Can't find the <code>.obsidian</code> folder? It might be hidden. On Windows, enable "Show hidden files" in File Explorer. On Mac/Linux, press Cmd+Shift+. (dot) or Ctrl+H to show hidden files.
      </div>
    `;

    new Setting(containerEl)
      .setName("Show Reload Button")
      .setDesc("Show reload button in the ribbon")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showReloadButton)
          .onChange(async (value) => {
            this.plugin.settings.showReloadButton = value;
            await this.plugin.saveSettings();

            new Notice("Reload the plugin to see ribbon button changes");
          })
      );

    new Setting(containerEl)
      .setName("Reload Icons")
      .setDesc("Manually reload all SVG icons from the icons folder")
      .addButton((button) =>
        button
          .setButtonText("Reload Now")
          .setCta()
          .onClick(async () => {
            await this.plugin.reloadIcons();
          })
      );

    const gridSection = containerEl.createEl("div", { cls: "grid-section" });
    gridSection.createEl("h3", { text: "Imported SVG Icons" });
    const gridContainer = gridSection.createEl("div", {
      cls: "svg-icons-grid",
    });

    this.displayIconsGrid(gridContainer);
  }

  async displayIconsGrid(container) {
    try {
      const iconsPath = normalizePath(
        `${this.app.vault.configDir}/plugins/${this.plugin.manifest.id}/icons`
      );

      const dirExists = await this.app.vault.adapter.exists(iconsPath);
      if (!dirExists) {
        container.innerHTML = `
          <div class="no-icons-message">
            <p>Icons directory not found: <code>${iconsPath}</code></p>
            <p>Please ensure the icons folder exists and contains SVG files.</p>
          </div>
        `;
        return;
      }

      const files = await this.app.vault.adapter.list(iconsPath);
      const svgFiles = files.files.filter((file) => file.endsWith(".svg"));

      if (svgFiles.length === 0) {
        container.innerHTML = `
          <div class="no-icons-message">
            <p>No SVG files found in the icons folder.</p>
            <p>Add some SVG files to <code>${iconsPath}</code> and reload.</p>
          </div>
        `;
        return;
      }

      const header = container.createEl("div", { cls: "grid-header" });

      const titleRow = header.createEl("div", { cls: "title-row" });
      titleRow.createEl("h4", {
        cls: "grid-title",
        text: "Available SVGs",
      });

      const rightSection = titleRow.createEl("div", { cls: "title-right" });
      const countBadge = rightSection.createEl("span", {
        cls: "icon-count",
        text: `${svgFiles.length} icons`,
      });

      const refreshBtn = rightSection.createEl("button", {
        cls: "refresh-grid-btn",
        text: "🔄",
        title: "Refresh Grid",
      });

      const searchContainer = header.createEl("div", {
        cls: "search-container",
      });
      const searchInput = searchContainer.createEl("input", {
        type: "text",
        placeholder: "Search icons...",
        cls: "icon-search-input",
      });

      const clearBtn = searchContainer.createEl("button", {
        cls: "clear-search-btn",
        text: "✕",
        title: "Clear search",
      });
      clearBtn.style.display = "none";

      const grid = container.createEl("div", { cls: "icons-grid" });

      const allIconCards = [];

      const filterIcons = (searchTerm) => {
        const term = searchTerm.toLowerCase().trim();
        let visibleCount = 0;

        allIconCards.forEach((card) => {
          const iconName = card
            .querySelector(".icon-name")
            .textContent.toLowerCase();
          const isVisible = iconName.includes(term);

          card.style.display = isVisible ? "block" : "none";
          if (isVisible) visibleCount++;
        });

        countBadge.textContent = term
          ? `${visibleCount} of ${svgFiles.length} icons`
          : `${svgFiles.length} icons`;

        clearBtn.style.display = term ? "block" : "none";
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

          const card = grid.createEl("div", { cls: "icon-card" });
          allIconCards.push(card);

          const preview = card.createEl("div", { cls: "icon-preview" });

          try {
            const svgContent = await this.app.vault.adapter.read(filePath);
            const processedSvg = this.plugin.processSvgForPreview(svgContent);
            preview.innerHTML = processedSvg;
          } catch (error) {
            console.error(`Failed to read SVG ${filePath}:`, error);

            preview.innerHTML =
              '<div style="color: var(--text-muted); font-size: 24px;">📄</div>';
          }

          const nameEl = card.createEl("div", {
            cls: "icon-name",
            text: iconName,
          });

          const copyBtn = card.createEl("button", {
            cls: "copy-button",
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

          card.addEventListener("mouseenter", () => {
            card.style.transform = "translateY(-2px)";
          });

          card.addEventListener("mouseleave", () => {
            card.style.transform = "translateY(0)";
          });
        } catch (error) {
          console.error(`Failed to process icon ${filePath}:`, error);

          const errorCard = grid.createEl("div", { cls: "icon-card error" });
          errorCard.innerHTML = `
            <div class="icon-preview">❌</div>
            <div class="icon-name">Error loading ${fileName}</div>
          `;
        }
      }

      refreshBtn.addEventListener("click", () => {
        container.innerHTML = "";
        this.displayIconsGrid(container);
      });
    } catch (error) {
      console.error("Error displaying icons grid:", error);
      container.innerHTML = `
        <div class="error-message">
          <p>Error loading icons: ${error.message}</p>
        </div>
      `;
    }
  }
}
