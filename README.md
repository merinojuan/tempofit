# TempoFit

Temporizador de intervalos para entrenar (Tabata, HIIT y circuitos).

## Stack

- Vite + React + TypeScript
- DaisyUI + Tailwind CSS
- IndexedDB (temporizadores guardados)
- pnpm

## Desarrollo

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

## Despliegue en GitHub Pages

El workflow `.github/workflows/deploy.yml` despliega automáticamente a GitHub Pages en cada push a `main`.

Configuración en el repositorio:

1. **Settings → Pages → Source**: seleccionar **GitHub Actions**.
2. Hacer push a la rama `main`.

La app quedará disponible en `https://<usuario>.github.io/<repo>/`.

## Características

- Configuración de tiempo de ejercicio, descanso y rondas (solo enteros).
- Mínimo configurable: 10 segundos.
- Cuenta regresiva de 10 segundos al iniciar cada sesión.
- Aviso sonoro en los 10 segundos previos al final de ejercicio y descanso.
- Guardado de temporizadores en IndexedDB (clave: `ejercicio+descanso+rondas`).
- Dark mode (temas `light` y `dark` de DaisyUI) persistido en localStorage.
- Diseño minimalista, centrado y responsive (ancho máximo `md`).
