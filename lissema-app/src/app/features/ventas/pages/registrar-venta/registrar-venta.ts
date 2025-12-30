import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray
} from '@angular/forms';
import { debounceTime } from 'rxjs';
import { take } from 'rxjs/operators';

import { VentaService } from '../../services/venta-service';
import { ProductoService } from '../../../productos/services/producto-service';
import { ClienteService } from '../../../clientes/services/cliente.service';

@Component({
  selector: 'app-registrar-venta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar-venta.html',
  styleUrls: ['./registrar-venta.css']
})
export class RegistrarVenta implements OnInit {

  @Output() cerrar = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private ventaService = inject(VentaService);
  private productoService = inject(ProductoService);
  private clienteService = inject(ClienteService);

  productos$ = this.productoService.productos$;
  clientes$ = this.clienteService.clientes$;

  form!: FormGroup;

  ngOnInit() {
    this.crearForm();
    this.productoService.cargarProductos();
    this.clienteService.cargarClientes();
  }

  crearForm() {
    this.form = this.fb.group({
      clienteId: [null, Validators.required],
      productoId: [null],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      detalles: this.fb.array([])
    });
  }

  get detalles(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  agregarProducto() {
    const productoId = this.form.get('productoId')?.value;
    const cantidad = this.form.get('cantidad')?.value;

    if (!productoId || cantidad <= 0) return;

    this.productos$.pipe(take(1)).subscribe(productos => {
      const producto = productos.find(p => p.id === productoId);
      if (!producto) return;

      const existente = this.detalles.controls.find(
        d => d.value.productoId === productoId
      );

      const cantidadActual = existente ? existente.value.cantidad : 0;
      const nuevaCantidad = cantidadActual + cantidad;
      const stockDisponible = producto.stock ?? 0;
      // 🧠 VALIDACIÓN DE STOCK
      if (nuevaCantidad > stockDisponible) {
        alert(`Stock insuficiente. Disponible: ${stockDisponible}`);
        return;
      }

      if (existente) {
        existente.patchValue({ cantidad: nuevaCantidad });
      } else {
        this.detalles.push(
          this.fb.group({
            productoId: [producto.id],
            nombre: [producto.nombre],
            precioUnitario: [producto.precioUnitario],
            cantidad: [cantidad]
          })
        );
      }

      this.form.get('productoId')?.reset();
      this.form.get('cantidad')?.setValue(1);
    });
  }

  eliminarDetalle(index: number) {
    this.detalles.removeAt(index);
  }

  get total(): number {
    return this.detalles.value.reduce(
      (sum: number, d: any) => sum + d.cantidad * d.precioUnitario,
      0
    );
  }

  get puedeGuardar(): boolean {
    return this.form.valid && this.detalles.length > 0;
  }

  guardarVenta() {
    if (!this.puedeGuardar) return;

    const venta = {
      clienteId: this.form.value.clienteId,
      total: this.total,
      detalles: this.detalles.value.map((d: any) => ({
        productoId: d.productoId,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario
      }))
    };

    this.ventaService.agregarVenta(venta).subscribe({
      next: () => {
        this.ventaService.cargarVentas();
        this.productoService.cargarProductos();
        this.cerrar.emit();
      },
      error: (err) => {
        alert(err.error?.message || 'Error al registrar la venta');
      }
    });
  }
}
