const socket = io();
const almacen = [];
const codigos = [];

socket.on("products", (producto, codigo) => {
  Object.assign(almacen, producto);
  Object.assign(codigos, codigo);
  crearHtml();
  let btnsEliminar = document.querySelectorAll(".btn");
  btnsEliminar.forEach((selectBtn) => {
    selectBtn.addEventListener("click", () => {
      selectBtn.className = "Elegido";
      let divBtn = document.querySelector(".Elegido").parentNode.parentNode;
      let codeproduct = divBtn.querySelector(".card-content .code").innerHTML;
      selectBtn.className = "btn";
      almacen.forEach((searchID) => {
        if (searchID.code == codeproduct) {
          Swal.fire({
            title:
              "DESEA ELIMINAR EL PRODUCTO " +
              searchID.tittle.toUpperCase() +
              " ?",
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: "SI",
            denyButtonText: "NO",
          }).then((result) => {
            if (result.isConfirmed) {
              almacen.splice(almacen.indexOf(searchID), 1);
              crearHtml();
              Swal.fire({
                title: "Producto Eliminado Exitosamente!",
                text: "Producto Eliminado: " + searchID.tittle,
                icon: "success",
                confirmButtonText: "Aceptar",
              });
              socket.emit(
                "ProductDeleted",
                searchID.id,
                almacen.indexOf(searchID)
              );
            } else if (result.isDenied) {
              Swal.fire("ACCIÓN CANCELADA", "", "info");
              selectBtn.className = "btn";
            }
          });
        }
      });
    });
  });
});

socket.on("f5deleteProduct", (deletedproduct) => {
  almacen.splice(deletedproduct, 1);
  crearHtml();
});

const form = document.querySelector("form");

const inputTittle = document.querySelector("#tittle"),
  inputDescription = document.querySelector("#description"),
  inputCode = document.querySelector("#code"),
  inputPrice = document.querySelector("#price"),
  inputStock = document.querySelector("#stock"),
  inputThumbnail = document.querySelector("#thumbnail"),
  contenedor = document.querySelector("#contenedor");

class Producto {
  constructor() {
    this.tittle = inputTittle.value;
    this.description = inputDescription.value;
    this.code = +inputCode.value;
    this.status = true;
    this.stock = +inputStock.value;
    this.category = "Food";
    this.price = +inputPrice.value;
    this.thumbnail = inputThumbnail.value;
  }
}

//funciones
function crearHtml() {
  contenedor.innerHTML = "";
  let html;
  for (const producto of almacen) {
    if (!producto.thumbnail) {
      producto.thumbnail =
        "https://finvero.com/assets/img/shoppers/products/Not_found.png ";
    }
    html = `<div class="col s4 m3">
 <div class="card">
<div class="card-image">
 <img class="responsive-img" src=${producto.thumbnail} />
 <span class="card-title">${producto.tittle}</span>
</div>
<div class="card-content">
 <b>
   ${producto.description}
 </b>
 <p>$${producto.price}</p>
 <b>Code: <b class="code">${producto.code}</b></b>
</div>
<div class="card-action">
 <input type= "button" class="btn" value="Eliminar" >
</div>
</div>
</div>`;
    contenedor.innerHTML += html;
  }
}

socket.on("f5NewProduct", (newproducto) => {
  almacen.push(newproducto);
  crearHtml();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const producto = new Producto();
  if (!codigos.includes(producto.code)) {
    //socket.emit("newProduct", producto);
    almacen.push(producto);
    crearHtml();
    Swal.fire({
      title: "Producto Añadido Exitosamente!",
      text: "Producto Registrado: " + producto.tittle,
      icon: "success",
      confirmButtonText: "Aceptar",
    });
    form.reset();
    socket.emit("addproduct", producto);
  } else {
    Swal.fire({
      title: "Error>> Codigo Repetido",
      text: "Por favor ingresar un nuevo codigo",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
    inputCode.value = "";
  }
});
