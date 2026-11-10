# Plan de pruebas: añadir productos al carrito en SauceDemo

## Application Overview

Plan de pruebas de la funcionalidad "añadir productos al carrito" de https://www.saucedemo.com, partiendo de /inventory.html. Todos los valores se verificaron navegando la aplicación el 2026-11-10 (versión SPA con UI nueva). Convenciones: testIdAttribute = data-test; usuario por defecto standard_user / secret_sauce; cada escenario parte de estado limpio (sesión nueva, login, localStorage `cart-contents` = "[]", badge ausente).

DATOS REALES DE PRODUCTOS (orden por defecto A-Z; id = parámetro de inventory-item.html?id=N; el botón Add es add-to-cart-<slug> y Remove es remove-<slug>):
1. Sauce Labs Backpack | slug sauce-labs-backpack | $29.99 | id 4
2. Sauce Labs Bike Light | slug sauce-labs-bike-light | $9.99 | id 0
3. Sauce Labs Bolt T-Shirt | slug sauce-labs-bolt-t-shirt | $15.99 | id 1
4. Sauce Labs Fleece Jacket | slug sauce-labs-fleece-jacket | $49.99 | id 5
5. Sauce Labs Onesie | slug sauce-labs-onesie | $7.99 | id 2
6. Test.allTheThings() T-Shirt (Red) | slug test.allthethings()-t-shirt-(red) (contiene puntos y paréntesis; usar getByTestId con cadena exacta, no CSS) | $15.99 | id 3

OBSERVACIONES DE LA APLICACIÓN (relevantes para el diseño de los tests):
- Estado del carrito: localStorage `cart-contents` es un array JSON de ids de producto en orden de inserción (ej. "[4,0,1,5,2,3]"). Vacío: "[]".
- Badge `shopping-cart-badge` NO existe en el DOM cuando el carrito está vacío (usar toHaveCount(0) / not.toBeVisible). El enlace `shopping-cart-link` tiene aria-label "Cart, empty" o "Cart, N items".
- Ordenación (`product-sort-container`, valores az / za / lohi / hilo; `active-option` muestra el texto). Orden A-Z: Backpack, Bike Light, Bolt T-Shirt, Fleece Jacket, Onesie, Test.allTheThings(). Z-A: inverso. lohi: Onesie 7.99, Bike Light 9.99, Bolt 15.99, Red 15.99, Backpack 29.99, Fleece 49.99. hilo: Fleece, Backpack, Bolt, Red, Bike Light, Onesie. Empates a $15.99 se resuelven Bolt antes que Red.
- Página de detalle /inventory-item.html?id=N: botones genéricos `add-to-cart` / `remove` (sin slug), `back-to-products`, `inventory-item-name`, `inventory-item-desc`, `inventory-item-price`. En el inventario y el carrito, los enlaces son `item-<id>-title-link` e `item-<id>-img-link` (solo título en el carrito).
- Carrito /cart.html: `cart-list`, `inventory-item` (por línea), `item-quantity` (siempre "1"), `inventory-item-name/desc/price`, `remove-<slug>`, `continue-shopping`, `checkout`. Se lista en orden de inserción (NO en orden alfabético). Con carrito vacío, Continue Shopping y Checkout siguen habilitados.
- Sin sesión, /inventory.html, /cart.html e /inventory-item.html redirigen a "/" con error `error`: "Epic sadface: You can only access '/<ruta>' when you are logged in."
- Menú lateral: inventory-sidebar-link (All Items), dynamic-catalog-sidebar-link (Dynamic Catalog, submenú Lazy Load / Spinner / Slider; fuera de alcance), about-sidebar-link, logout-sidebar-link, reset-sidebar-link.
- Consola: error recurrente "Permissions policy violation: unload is not allowed" (ruido de la app; no debe provocar fallo de los tests).

COMPORTAMIENTOS INESPERADOS / DEFECTOS CONFIRMADOS (standard_user):
- D1: "Reset App State" vacía el carrito (badge desaparece, localStorage "[]") pero los botones del inventario NO se reinician en la UI (siguen mostrando Remove hasta recargar). Tras recargar sí aparecen todos como Add to cart.
- D2: La ordenación elegida no persiste tras recargar (vuelve a "Name (A to Z)"), aunque el contenido del carrito sí se mantiene.
- D3: El carrito persiste tras logout y nuevo login (localStorage no se limpia al hacer logout). Puede ser intencional, pero conviene documentarlo como comportamiento a vigilar.
- D4: Doble clic rápido (dblclick) sobre "Add to cart" produce add y luego remove: el resultado neto es producto NO añadido (badge ausente, "[]"). No es un doble alta, pero es un hallazgo de UX.
- D5: Visitar inventory-item.html?id=99 muestra una página "ITEM NOT FOUND" con texto humorístico, precio "$√-1" y un botón "Add to cart" activo (no hay manejo de error correcto).

USUARIOS ESPECIALES (observado, contraseña secret_sauce):
- problem_user: todas las imágenes son la misma (sl-404-...jpg). Al pulsar Add en los 6 productos solo se añaden Backpack, Bike Light y Onesie (badge 3, localStorage "[4,0,2]"); Bolt T-Shirt, Fleece Jacket y Test.allTheThings() no se añaden (botón sigue en Add). Los botones Remove de los 3 productos añadidos no funcionan (badge sigue en 3, botones siguen en Remove, también tras recargar).
- error_user: en la sesión probada mostró exactamente el mismo comportamiento de carrito que problem_user (solo 3 productos añadibles: ids 4,0,2; Remove no funciona) pero con imágenes correctas.
- performance_glitch_user: login tarda ~5.1 s (frente a ~0.1 s); añadir funciona correctamente (badge 1..6, "[4,0,1,5,2,3]"), clic en Add ~180 ms.
- visual_user: añadir funciona (badge 1..6) pero los precios del inventario son aleatorios/incorrectos ($3.45, $87.01, $8.34, $60.21, $77.88, $79.10) mientras que el carrito muestra los precios reales (29.99, 9.99, 15.99, 49.99, 7.99, 15.99); además el botón Checkout aparece desplazado/ solapado.

NOTA SOBRE EL TEST EXISTENTE: tests/cart/add-to-cart.spec.ts (Bolt T-Shirt, badge "1", botón Remove) ya cubre el caso trivial; este plan lo amplía y NO lo repite como escenario aislado (aparece solo como parte de verificaciones más ricas). Se sugiere ampliar src/data/products.ts con los 6 productos (name, slug, price, id) y añadir a InventoryPage/nuevo CartPage/ProductDetailPage los localizadores indicados.

## Test Scenarios

### 1. Suite 1: Añadir y quitar productos desde el inventario

**Seed:** `tests/seed.spec.ts`

#### 1.1. 1.1 Añadir cada uno de los 6 productos individualmente (parametrizado)

**File:** `tests/cart/add-each-product.spec.ts`

**Steps:**
  1. Precondición: login como standard_user y estar en /inventory.html con carrito vacío. Para cada producto de la tabla de datos (Backpack, Bike Light, Bolt T-Shirt, Fleece Jacket, Onesie, Test.allTheThings() Red) en un test independiente: pulsar add-to-cart-<slug>.
    - expect: El botón add-to-cart-<slug> deja de existir y aparece remove-<slug> con texto 'Remove'.
    - expect: El badge shopping-cart-badge muestra '1' y el aria-label del enlace del carrito es 'Cart, 1 items'.
    - expect: Los otros 5 productos siguen con botón 'Add to cart'.
    - expect: localStorage cart-contents es '[<id>]' (ej. '[4]' para Backpack, '[3]' para Red).
  2. Comprobar que nombre y precio mostrados en la tarjeta no cambian tras añadir.
    - expect: Precio igual al de la tabla (ej. $29.99 para Backpack, $7.99 para Onesie).

#### 1.2. 1.2 Añadir los 6 productos y comprobar el contador del badge incremental

**File:** `tests/cart/add-all-products-badge.spec.ts`

**Steps:**
  1. Precondición: login standard_user, carrito vacío. Comprobar que el badge no existe en el DOM y el aria-label es 'Cart, empty'.
    - expect: shopping-cart-badge tiene count 0.
  2. Pulsar secuencialmente los 6 botones Add en orden de lista, verificando el badge tras cada clic.
    - expect: Badge: 1, 2, 3, 4, 5, 6 respectivamente.
    - expect: Tras el último, los 6 botones son 'Remove' y aria-label es 'Cart, 6 items'.
    - expect: localStorage cart-contents = '[4,0,1,5,2,3]'.

#### 1.3. 1.3 Quitar productos desde el inventario con Remove hasta vaciar el carrito

**File:** `tests/cart/remove-from-inventory.spec.ts`

**Steps:**
  1. Precondición: login; añadir los 6 productos. Pulsar remove-sauce-labs-backpack.
    - expect: Botón vuelve a 'Add to cart' para Backpack; badge '5'; cart-contents '[0,1,5,2,3]'.
  2. Quitar los 5 restantes uno a uno.
    - expect: Badge baja 4, 3, 2, 1 y finalmente desaparece del DOM (count 0).
    - expect: aria-label 'Cart, empty'; cart-contents '[]'.
    - expect: Los 6 botones vuelven a 'Add to cart'.

#### 1.4. 1.4 Añadir, quitar y volver a añadir el mismo producto (ciclo)

**File:** `tests/cart/add-remove-add-cycle.spec.ts`

**Steps:**
  1. Precondición: login. Añadir Sauce Labs Onesie, quitarlo y añadirlo de nuevo.
    - expect: Tras el primer Add badge '1'; tras Remove badge ausente; tras el segundo Add badge '1' y cart-contents '[2]' (sin duplicados).

#### 1.5. 1.5 Añadir dos productos con el mismo precio ($15.99) y verificar identidad

**File:** `tests/cart/add-same-price-products.spec.ts`

**Steps:**
  1. Precondición: login. Añadir Bolt T-Shirt ($15.99) y Test.allTheThings() T-Shirt (Red) ($15.99).
    - expect: Badge '2'; cart-contents '[1,3]'.
    - expect: En /cart.html aparecen dos líneas distintas con nombres Bolt T-Shirt y Test.allTheThings() T-Shirt (Red), ambas $15.99, cantidad 1.

### 2. Suite 2: Añadir desde la página de detalle y sincronización

**Seed:** `tests/seed.spec.ts`

#### 2.1. 2.1 Añadir desde detalle y verificar sincronización al volver al inventario

**File:** `tests/cart/add-from-detail.spec.ts`

**Steps:**
  1. Precondición: login. Hacer clic en el nombre 'Sauce Labs Bolt T-Shirt' (item-1-title-link).
    - expect: URL /inventory-item.html?id=1.
    - expect: Se muestran nombre, descripción ('Get your testing superhero on...'), precio $15.99 y botón 'Add to cart' (data-test add-to-cart). Badge ausente.
  2. Pulsar add-to-cart en el detalle.
    - expect: El botón pasa a data-test 'remove' con texto 'Remove'; badge '1'.
  3. Pulsar back-to-products.
    - expect: URL /inventory.html; remove-sauce-labs-bolt-t-shirt visible (Remove) y los otros 5 con Add; badge '1'; cart-contents '[1]'.

#### 2.2. 2.2 Entrar por la imagen del producto y quitar desde el detalle un producto añadido en el inventario

**File:** `tests/cart/remove-from-detail.spec.ts`

**Steps:**
  1. Precondición: login; añadir Sauce Labs Onesie desde el inventario. Clic en la imagen (item-2-img-link).
    - expect: URL /inventory-item.html?id=2; el botón muestra 'Remove' (estado sincronizado); badge '1'.
  2. Pulsar remove y volver al inventario (back-to-products).
    - expect: Badge ausente; botón add-to-cart-sauce-labs-onesie visible con 'Add to cart'; cart-contents '[]'.

#### 2.3. 2.3 Acceder al detalle desde el carrito y mantener estado

**File:** `tests/cart/detail-from-cart.spec.ts`

**Steps:**
  1. Precondición: login; añadir Test.allTheThings() T-Shirt (Red); abrir carrito; clic en el nombre (item-3-title-link).
    - expect: URL /inventory-item.html?id=3; botón 'Remove' visible; badge '1'.

#### 2.4. 2.4 Detalle de producto inexistente (id=99)

**File:** `tests/cart/detail-invalid-id.spec.ts`

**Steps:**
  1. Precondición: login. Navegar directamente a /inventory-item.html?id=99.
    - expect: Se muestra 'ITEM NOT FOUND' con mensaje de error y precio '$√-1'.
    - expect: DEFECTO D5: aparece un botón 'Add to cart' activo. Documentar; el test debe verificar que, si se pulsa, el cart-contents no recibe un id válido inesperado (registrar comportamiento real) o marcarse test.fail() si se exige que el botón no exista.

### 3. Suite 3: Ordenación combinada con el carrito

**Seed:** `tests/seed.spec.ts`

#### 3.1. 3.1 El estado Add/Remove sigue al producto al cambiar la ordenación

**File:** `tests/cart/sort-keeps-cart-state.spec.ts`

**Steps:**
  1. Precondición: login. Seleccionar 'Price (low to high)' (lohi): el orden esperado es Onesie $7.99, Bike Light $9.99, Bolt $15.99, Red $15.99, Backpack $29.99, Fleece $49.99. Añadir Sauce Labs Onesie (primera tarjeta).
    - expect: Badge '1'; Onesie con 'Remove'.
  2. Cambiar a 'Name (Z to A)' (za).
    - expect: Orden: Test.allTheThings() Red, Onesie, Fleece, Bolt, Bike Light, Backpack.
    - expect: Solo la segunda tarjeta (Onesie) muestra 'Remove'; las demás 'Add to cart'; badge sigue en '1'.

#### 3.2. 3.2 Añadir productos en cada orden de clasificación y comprobar orden de inserción en el carrito

**File:** `tests/cart/sort-then-add-cart-order.spec.ts`

**Steps:**
  1. Precondición: login. Seleccionar 'Price (high to low)' (hilo: Fleece, Backpack, Bolt, Red, Bike Light, Onesie). Añadir Fleece Jacket, luego Onesie, luego Backpack.
    - expect: Badge '3'; cart-contents '[5,2,4]'.
  2. Ir a /cart.html.
    - expect: Líneas en orden de inserción: Fleece Jacket $49.99, Onesie $7.99, Backpack $29.99 (no por orden alfabético), cada una cantidad 1.

#### 3.3. 3.3 Verificar los cuatro criterios de ordenación con datos reales

**File:** `tests/cart/sort-options.spec.ts`

**Steps:**
  1. Precondición: login. Recorrer az, za, lohi, hilo con selectOption en product-sort-container.
    - expect: active-option muestra respectivamente 'Name (A to Z)', 'Name (Z to A)', 'Price (low to high)', 'Price (high to low)'.
    - expect: Precios en lohi: $7.99, $9.99, $15.99, $15.99, $29.99, $49.99; en hilo el inverso.
    - expect: Los 6 botones pueden añadirse en cualquier orden activo.

#### 3.4. 3.4 La ordenación no persiste tras recargar pero el carrito sí (defecto D2)

**File:** `tests/cart/sort-reload.spec.ts`

**Steps:**
  1. Precondición: login; seleccionar hilo; añadir los 6 productos; recargar la página (F5).
    - expect: Badge '6' y 6 botones 'Remove' se mantienen.
    - expect: El select vuelve a 'az' (Name A to Z) y el orden es el alfabético por defecto (documentar como defecto D2; si se prefiere, anotar con test.fail).

### 4. Suite 4: Página del carrito (/cart.html)

**Seed:** `tests/seed.spec.ts`

#### 4.1. 4.1 Los datos del carrito coinciden con el inventario

**File:** `tests/cart/cart-matches-inventory.spec.ts`

**Steps:**
  1. Precondición: login. Leer nombre, descripción y precio de Backpack, Fleece Jacket y Onesie en el inventario; añadirlos; pulsar shopping-cart-link.
    - expect: URL /cart.html, título 'Your Cart', cabeceras 'QTY' y 'Description'.
    - expect: 3 líneas inventory-item en orden Backpack ($29.99), Fleece Jacket ($49.99), Onesie ($7.99).
    - expect: item-quantity '1' en cada línea; nombre, descripción y precio idénticos a los del inventario.
    - expect: Cada línea tiene botón remove-<slug> con texto 'Remove'; existen continue-shopping y checkout.

#### 4.2. 4.2 Quitar un producto desde el carrito

**File:** `tests/cart/remove-from-cart-page.spec.ts`

**Steps:**
  1. Precondición: login; añadir los 6 productos; ir al carrito; pulsar remove-sauce-labs-bike-light.
    - expect: Línea Bike Light desaparece; quedan 5 líneas; badge '5'; cart-contents '[4,1,5,2,3]'.
  2. Pulsar continue-shopping.
    - expect: URL /inventory.html; add-to-cart-sauce-labs-bike-light visible (Add); los otros 5 con Remove; badge '5'.

#### 4.3. 4.3 Carrito vacío

**File:** `tests/cart/empty-cart.spec.ts`

**Steps:**
  1. Precondición: login sin añadir nada. Pulsar shopping-cart-link.
    - expect: /cart.html sin líneas (inventory-item count 0); aria-label 'Cart, empty'; badge ausente.
    - expect: continue-shopping y checkout visibles y habilitados (comportamiento observado; checkout con carrito vacío no está bloqueado).

#### 4.4. 4.4 Vaciar el carrito quitando todos los productos desde /cart.html

**File:** `tests/cart/empty-by-removing.spec.ts`

**Steps:**
  1. Precondición: login; añadir Red T-Shirt, Bike Light y Fleece Jacket (en ese orden); ir al carrito (orden esperado: Red $15.99, Bike Light $9.99, Fleece $49.99). Quitar los 3.
    - expect: 0 líneas; badge ausente; cart-contents '[]'.
    - expect: Continue Shopping lleva al inventario con los 6 botones en 'Add to cart'.

#### 4.5. 4.5 Continue Shopping conserva el estado y permite seguir añadiendo

**File:** `tests/cart/continue-shopping-add-more.spec.ts`

**Steps:**
  1. Precondición: login; añadir Backpack; ir al carrito; pulsar continue-shopping; añadir Bolt T-Shirt; volver a abrir el carrito.
    - expect: Tras continuar, Backpack aparece con 'Remove' y badge '1'; tras añadir Bolt, badge '2'.
    - expect: Carrito con 2 líneas: Backpack $29.99 y Bolt T-Shirt $15.99 en ese orden.

### 5. Suite 5: Persistencia, menú lateral y sesión

**Seed:** `tests/seed.spec.ts`

#### 5.1. 5.1 El carrito persiste al recargar y al navegar entre páginas

**File:** `tests/cart/persistence-reload-navigation.spec.ts`

**Steps:**
  1. Precondición: login; añadir Backpack y Onesie; recargar /inventory.html; ir a /cart.html por URL directa (page.goto); volver a /inventory.html por URL directa.
    - expect: En todas las páginas badge '2'; cart-contents '[4,2]'; en el inventario Backpack y Onesie con 'Remove'.

#### 5.2. 5.2 Menú lateral: All Items conserva el carrito

**File:** `tests/cart/sidebar-all-items.spec.ts`

**Steps:**
  1. Precondición: login; añadir Fleece Jacket; ir al carrito; abrir menú (Open Menu) y pulsar inventory-sidebar-link (All Items).
    - expect: URL /inventory.html; badge '1'; Fleece Jacket con 'Remove'. El menú muestra: All Items, Dynamic Catalog, About, Logout, Reset App State.

#### 5.3. 5.3 Reset App State vacía el carrito (y defecto D1 de botones sin reiniciar)

**File:** `tests/cart/reset-app-state.spec.ts`

**Steps:**
  1. Precondición: login; añadir Backpack, Bike Light, Bolt T-Shirt; abrir menú y pulsar reset-sidebar-link.
    - expect: Badge desaparece; cart-contents '[]'; URL permanece /inventory.html.
  2. Sin recargar, inspeccionar los botones del inventario.
    - expect: DEFECTO D1 observado: los 3 productos siguen mostrando 'Remove' aunque el carrito está vacío (la UI no se reinicia). Registrar con test.fail() o expect.soft.
  3. Recargar la página.
    - expect: Los 6 botones muestran 'Add to cart'; badge ausente.

#### 5.4. 5.4 Reset App State desde la página del carrito

**File:** `tests/cart/reset-from-cart.spec.ts`

**Steps:**
  1. Precondición: login; añadir 2 productos; ir a /cart.html; abrir menú y pulsar Reset App State.
    - expect: Verificar y registrar el estado real de la lista del carrito y del badge (badge ausente y cart-contents '[]'); recargar /cart.html debe mostrar 0 líneas.

#### 5.5. 5.5 Logout y nuevo login conservan el carrito (D3)

**File:** `tests/cart/persistence-logout-login.spec.ts`

**Steps:**
  1. Precondición: login; añadir Bolt T-Shirt; abrir menú y pulsar logout-sidebar-link.
    - expect: URL https://www.saucedemo.com/ (login); localStorage cart-contents sigue siendo '[1]'.
  2. Iniciar sesión de nuevo con standard_user.
    - expect: Badge '1'; remove-sauce-labs-bolt-t-shirt visible; los otros 5 con 'Add to cart'. Documentar como D3 (el carrito no se limpia al cerrar sesión).

### 6. Suite 6: Casos negativos y de borde

**Seed:** `tests/seed.spec.ts`

#### 6.1. 6.1 Acceso directo a /inventory.html sin sesión

**File:** `tests/cart/unauthenticated-inventory.spec.ts`

**Steps:**
  1. Precondición: contexto nuevo sin cookies/localStorage. Navegar a /inventory.html.
    - expect: Redirección a '/' (login); data-test 'error' muestra "Epic sadface: You can only access '/inventory.html' when you are logged in.".

#### 6.2. 6.2 Acceso directo a /cart.html e /inventory-item.html?id=1 sin sesión

**File:** `tests/cart/unauthenticated-cart.spec.ts`

**Steps:**
  1. Precondición: contexto nuevo. Navegar a /cart.html y luego a /inventory-item.html?id=1.
    - expect: Ambas redirigen a '/' con error "Epic sadface: You can only access '/cart.html' when you are logged in." y "...'/inventory-item.html'..." respectivamente.
    - expect: No se ve ningún botón de añadir.

#### 6.3. 6.3 Doble clic rápido sobre Add to cart (D4)

**File:** `tests/cart/double-click-add.spec.ts`

**Steps:**
  1. Precondición: login. Hacer dblclick sobre add-to-cart-sauce-labs-backpack.
    - expect: Resultado observado: el primer clic añade y el segundo quita; badge ausente, botón 'Add to cart', cart-contents '[]'. En ningún caso badge '2' ni id duplicado.
  2. Pulsar un único clic después.
    - expect: Badge '1' y botón 'Remove'; cart-contents '[4]' (sin duplicados).

#### 6.4. 6.4 Clics repetidos en distintos productos no generan duplicados

**File:** `tests/cart/no-duplicate-quantities.spec.ts`

**Steps:**
  1. Precondición: login. Añadir Backpack, ir al carrito, volver y comprobar que no existe ya add-to-cart-sauce-labs-backpack (no se puede añadir dos unidades).
    - expect: item-quantity siempre '1'; no es posible cantidad 2 desde la UI.

#### 6.5. 6.5 Carrito manipulado en localStorage con id inválido

**File:** `tests/cart/localstorage-tampering.spec.ts`

**Steps:**
  1. Precondición: login. Con page.evaluate fijar localStorage cart-contents='[99]' y recargar /cart.html. (Escenario exploratorio: registrar el comportamiento real, no se verificó previamente.)
    - expect: Documentar si la app falla, ignora el id o muestra una línea vacía; no debe producirse una excepción no controlada que rompa la página.

### 7. Suite 7 (opcional): Usuarios especiales, detección de defectos

**Seed:** `tests/seed.spec.ts`

#### 7.1. 7.1 problem_user: no se pueden añadir todos los productos ni quitar

**File:** `tests/cart/problem-user-cart.spec.ts`

**Steps:**
  1. Precondición: login con problem_user / secret_sauce. Pulsar los 6 botones Add en orden.
    - expect: Comportamiento observado (defecto): solo Backpack, Bike Light y Onesie cambian a 'Remove' (badge 1, 2, 2, 2, 3, 3); cart-contents '[4,0,2]'. Bolt T-Shirt, Fleece Jacket y Red permanecen en 'Add to cart'.
    - expect: Todas las imágenes usan sl-404-*.jpg.
  2. Pulsar Remove en los 3 añadidos.
    - expect: Badge permanece en '3' y los botones siguen en 'Remove' (incluso tras recargar). Marcar el test con test.fail() / como detección de defecto.

#### 7.2. 7.2 error_user: añadir/quitar con fallos

**File:** `tests/cart/error-user-cart.spec.ts`

**Steps:**
  1. Precondición: login con error_user. Repetir los pasos de 7.1.
    - expect: Comportamiento observado: idéntico a problem_user en el carrito (3 productos añadidos, ids 4,0,2; Remove sin efecto) pero con imágenes correctas. Revisar también errores de consola/alertas (no verificado) y marcar como defecto.

#### 7.3. 7.3 performance_glitch_user: login lento pero carrito correcto

**File:** `tests/cart/performance-user-cart.spec.ts`

**Steps:**
  1. Precondición: login con performance_glitch_user (esperar hasta 15 s a que aparezca el inventario; login medido ~5.1 s). Añadir los 6 productos.
    - expect: Badge 1..6; cart-contents '[4,0,1,5,2,3]'; en /cart.html precios $29.99, $9.99, $15.99, $49.99, $7.99, $15.99.

#### 7.4. 7.4 visual_user: precios del inventario incoherentes con el carrito

**File:** `tests/cart/visual-user-cart.spec.ts`

**Steps:**
  1. Precondición: login con visual_user. Leer precios en el inventario y añadir los 6 productos.
    - expect: Precios del inventario observados: $3.45, $87.01, $8.34, $60.21, $77.88, $79.10 (distintos a los reales).
    - expect: Badge llega a 6 y cart-contents '[4,0,1,5,2,3]'; en /cart.html los precios son los reales ($29.99, $9.99, $15.99, $49.99, $7.99, $15.99): incoherencia entre inventario y carrito (defecto). Checkout con posición/maquetación alterada.

#### 7.5. 7.5 locked_out_user no accede al inventario

**File:** `tests/cart/locked-out-user.spec.ts`

**Steps:**
  1. Precondición: página de login. Intentar login con locked_out_user / secret_sauce.
    - expect: Permanece en '/'; se muestra un mensaje de error (usuario bloqueado) y no se llega a /inventory.html; no hay posibilidad de añadir al carrito. (Mensaje exacto no verificado en esta exploración; confirmar al implementar.)
