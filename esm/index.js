/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { COMMON_DIRECTIVES, COMMON_PIPES } from '@angular/common';
import { COMPILER_PROVIDERS, CompilerConfig, ResourceLoader, RUNTIME_COMPILER_FACTORY } from '@angular/compiler';
import { AppModule, ApplicationRef, PLATFORM_DIRECTIVES, PLATFORM_PIPES, ReflectiveInjector, coreLoadAndBootstrap, bootstrapModule, PLATFORM_INITIALIZER, CompilerFactory, createPlatformFactory } from '@angular/core';
import { BrowserModule, WORKER_APP_APPLICATION_PROVIDERS, WORKER_SCRIPT, WORKER_UI_APPLICATION_PROVIDERS, workerAppPlatform, workerUiPlatform, BROWSER_PLATFORM_PROVIDERS } from '@angular/platform-browser';
import { ReflectionCapabilities, reflector } from './core_private';
import { PromiseWrapper } from './src/facade/async';
import { isPresent } from './src/facade/lang';
import { CachedResourceLoader } from './src/xhr/xhr_cache';
import { TemplateLoaderImpl } from './src/xhr/xhr_impl';
/**
 * @deprecated The compiler providers are already included in the {@link CompilerFactory} that is
 * contained the {@link browserDynamicPlatform}()`.
 */
export const BROWSER_APP_COMPILER_PROVIDERS = [
    COMPILER_PROVIDERS, {
        provide: CompilerConfig,
        useFactory: (platformDirectives, platformPipes) => {
            return new CompilerConfig({
                deprecatedPlatformDirectives: platformDirectives,
                deprecatedPlatformPipes: platformPipes
            });
        },
        deps: [PLATFORM_DIRECTIVES, PLATFORM_PIPES]
    },
    { provide: ResourceLoader, useClass: TemplateLoaderImpl },
    { provide: PLATFORM_DIRECTIVES, useValue: COMMON_DIRECTIVES, multi: true },
    { provide: PLATFORM_PIPES, useValue: COMMON_PIPES, multi: true }
];
/**
 * Provider for using the resource cache while fetching template resources
 *
 * @experimental
 */
export const RESOURCE_CACHE_PROVIDER = [{ provide: ResourceLoader, useClass: CachedResourceLoader }];
function initReflector() {
    reflector.reflectionCapabilities = new ReflectionCapabilities();
}
/**
 * CompilerFactory for the browser dynamic platform
 *
 * @experimental
 */
export const BROWSER_DYNAMIC_COMPILER_FACTORY = RUNTIME_COMPILER_FACTORY.withDefaults({ providers: [{ provide: ResourceLoader, useClass: TemplateLoaderImpl }] });
/**
 * Providers for the browser dynamic platform
 *
 * @experimental
 */
export const BROWSER_DYNAMIC_PLATFORM_PROVIDERS = [
    BROWSER_PLATFORM_PROVIDERS,
    { provide: CompilerFactory, useValue: BROWSER_DYNAMIC_COMPILER_FACTORY },
    { provide: PLATFORM_INITIALIZER, useValue: initReflector, multi: true },
];
/**
 * @experimental API related to bootstrapping are still under review.
 */
export const browserDynamicPlatform = createPlatformFactory('browserDynamic', BROWSER_DYNAMIC_PLATFORM_PROVIDERS);
export function bootstrap(appComponentType, customProvidersOrDynamicModule) {
    let compilerOptions;
    let compilerProviders = [];
    let providers = [];
    let directives = [];
    let pipes = [];
    let modules = [];
    let precompile = [];
    if (customProvidersOrDynamicModule instanceof Array) {
        providers = customProvidersOrDynamicModule;
    }
    else if (customProvidersOrDynamicModule) {
        providers = normalizeArray(customProvidersOrDynamicModule.providers);
        directives = normalizeArray(customProvidersOrDynamicModule.directives);
        pipes = normalizeArray(customProvidersOrDynamicModule.pipes);
        modules = normalizeArray(customProvidersOrDynamicModule.modules);
        precompile = normalizeArray(customProvidersOrDynamicModule.precompile);
        compilerOptions = customProvidersOrDynamicModule.compilerOptions;
    }
    class DynamicModule {
    }
    /** @nocollapse */
    DynamicModule.decorators = [
        { type: AppModule, args: [{
                    providers: providers,
                    modules: modules.concat([BrowserModule]),
                    directives: directives,
                    pipes: pipes,
                    precompile: precompile.concat([appComponentType])
                },] },
    ];
    return bootstrapModule(DynamicModule, browserDynamicPlatform(), CompilerFactory.mergeOptions(compilerOptions, { deprecatedAppProviders: providers }))
        .then((moduleRef) => {
        const appRef = moduleRef.injector.get(ApplicationRef);
        return appRef.bootstrap(appComponentType);
    });
}
/**
 * @deprecated Create an {@link AppModule} that includes the {@link WorkerUiModule} and use {@link
 * bootstrapModule}
 * with the {@link workerUiPlatform}() instead.
 */
export function bootstrapWorkerUi(workerScriptUri, customProviders) {
    console.warn('bootstrapWorkerUi is deprecated. Create an @AppModule that includes the `WorkerUiModule` and use `bootstrapModule` with the `workerUiPlatform()` instead.');
    var app = ReflectiveInjector.resolveAndCreate([
        WORKER_UI_APPLICATION_PROVIDERS, BROWSER_APP_COMPILER_PROVIDERS,
        { provide: WORKER_SCRIPT, useValue: workerScriptUri },
        isPresent(customProviders) ? customProviders : []
    ], workerUiPlatform().injector);
    // Return a promise so that we keep the same semantics as Dart,
    // and we might want to wait for the app side to come up
    // in the future...
    return PromiseWrapper.resolve(app.get(ApplicationRef));
}
/**
 * @deprecated The compiler providers are already included in the {@link CompilerFactory} that is
 * contained the {@link workerAppPlatform}().
 */
const WORKER_APP_COMPILER_PROVIDERS = [
    COMPILER_PROVIDERS, {
        provide: CompilerConfig,
        useFactory: (platformDirectives, platformPipes) => {
            return new CompilerConfig({
                deprecatedPlatformDirectives: platformDirectives,
                deprecatedPlatformPipes: platformPipes
            });
        },
        deps: [PLATFORM_DIRECTIVES, PLATFORM_PIPES]
    },
    { provide: ResourceLoader, useClass: TemplateLoaderImpl },
    { provide: PLATFORM_DIRECTIVES, useValue: COMMON_DIRECTIVES, multi: true },
    { provide: PLATFORM_PIPES, useValue: COMMON_PIPES, multi: true }
];
/**
 * @deprecated Create an {@link AppModule} that includes the {@link WorkerAppModule} and use {@link
 * bootstrapModule}
 * with the {@link workerAppPlatform}() instead.
 */
export function bootstrapWorkerApp(appComponentType, customProviders) {
    console.warn('bootstrapWorkerApp is deprecated. Create an @AppModule that includes the `WorkerAppModule` and use `bootstrapModule` with the `workerAppPlatform()` instead.');
    var appInjector = ReflectiveInjector.resolveAndCreate([
        WORKER_APP_APPLICATION_PROVIDERS, WORKER_APP_COMPILER_PROVIDERS,
        isPresent(customProviders) ? customProviders : []
    ], workerAppPlatform().injector);
    return coreLoadAndBootstrap(appComponentType, appInjector);
}
function normalizeArray(arr) {
    return arr ? arr : [];
}
//# sourceMappingURL=index.js.map