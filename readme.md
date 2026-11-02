# 🤖 Traductor IA en Chrome 100% En Local

Este es un simple proyecto web que demuestra el uso de la **API de Traductor de Chrome** para realizar traducciones de texto directamente en el dispositivo sin necesidad de internet una vez descargado automaticamente el modelo correspondiente al pais, sin llamadas a servidor, todo queda en tu dispositivo. La interfaz está diseñada con **[Luz DS](https://github.com/nandovejer/luz)**, lo que le da un aspecto limpio y minimalista.

## ✨ Características Principales

  * **Traducción sin conexión:** Utiliza los modelos de traducción incorporados en Chrome, lo que significa que las traducciones se realizan localmente sin necesidad de una conexión a internet una vez que los modelos se han descargado.
  * **Selección de idiomas:** Permite a los usuarios elegir el idioma de origen y el de destino de forma sencilla.
  * **Interfaz de usuario simple:** El diseño es intuitivo y accesible, gracias al uso del sistema de diseño Luz DS.

## ⚠️ Requisitos

Esta aplicación depende de la API experimental **Chrome Translator**, que solo está disponible en **Chrome 138+ en versiones de escritorio**. No funcionará en otros navegadores ni en versiones anteriores de Chrome.

## 🚀 Cómo Usar

1.  **Abre el archivo:** Simplemente abre el archivo `index.html` en una versión de Chrome compatible (o ejecuta `npm start` para servirlo en local).
2.  **Selecciona los idiomas:** Elige el idioma de origen y el de destino en los menús desplegables.
3.  **Introduce el texto:** Escribe o pega el texto que deseas traducir en el área de texto.
4.  **Traduce:** Haz clic en el botón "Translate" para ver el resultado.

## 📦 Estilos (Luz DS)

Luz DS se instala desde npm y se copia a `vendor/luz/` (que sí se sube al repo, porque GitHub Pages no ejecuta `npm install`):

```bash
npm install        # instala Luz DS y copia sus CSS y fuentes a vendor/luz/
npm run vendor     # vuelve a copiarlos tras actualizar la versión
npm run check      # valida las clases Luz de index.html con luz-check
npm start          # sirve la web en local
```

## 🛠️ Cómo Funciona el Código

El corazón de la aplicación es el código JavaScript, que interactúa con el objeto `Translator` que proporciona la API de Chrome.

1.  **Verificación de idiomas:** Antes de traducir, el código usa `Translator.availability()` para comprobar si existe un modelo de traducción para el par de idiomas seleccionado en el dispositivo.
2.  **Gestión de modelos:** Si un modelo no está disponible, la API puede indicar que es `"downloadable"`. El código incluye un monitor de progreso que muestra al usuario cuándo se está descargando un modelo.
3.  **Traducción:** Una vez que el modelo está listo (`"available"`), se llama a `Translator.create()` para crear una instancia del traductor. Luego, el método `translator.translate(text)` realiza la traducción.
4.  **Limitaciones:** La API **no soporta todos los pares de idiomas**. Si una combinación específica (por ejemplo, inglés a catalán) no está disponible, la aplicación mostrará un mensaje de "Unsupported pair" (par no soportado), ya que la API solo incluye modelos para un conjunto limitado de idiomas comunes.

## 📚 Créditos

  * **Luz DS:** Este proyecto utiliza el sistema de diseño [Luz DS](https://github.com/nandovejer/luz) (`@luz-ds/tokens` y `@luz-ds/core`) para el diseño y la maquetación.
  * **Chrome Translator API:** La funcionalidad se basa en la [API de Traductor de Chrome](https://www.google.com/search?q=https://developer.chrome.com/docs/web-platform/translator-api), una nueva característica de la plataforma web.
