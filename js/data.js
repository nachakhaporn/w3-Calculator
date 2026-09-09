// ─── Helper: ผูกข้อมูลเข้า element แล้วลบ class 'undefined' ─────────────────
function setVal(id, value, useHTML = false) {
    const el = document.getElementById(id)
    if (!el) return
    if (useHTML) {
        el.innerHTML = value
    } else {
        el.innerText = value
    }
    el.classList.remove('undefined')
}

// ─── คำนวณ Subtotal / Tax / Total ────────────────────────────────────────────
function calculateTotals(data) {
    let subtotal = 0
    data.items.forEach(item => {
        item.subtotal = item.quantity * item.unitPrice
        subtotal += item.subtotal
    })
    const tax = subtotal * data.invoice.taxRate
    const total = subtotal + tax
    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax:      parseFloat(tax.toFixed(2)),
        total:    parseFloat(total.toFixed(2))
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // ── Box1: Company Info ──────────────────────────────────────────────────
    // company-name
    setVal('company-name', data.company.name)

    // com-addr → แสดง address + contact รวมกัน
    const addrLines = data.company.address.concat(data.company.contact)
    setVal('com-addr', addrLines.join('<br>'), true)

    // com-logo → ใส่ภาพโลโก้
    setVal('com-logo', '<img src="./img/logo-spu.png" width="100" height="100" alt="Company Logo">', true)

    // ── Box2: Bill To / Ship To / Invoice Details ───────────────────────────
    // Bill To
    setVal('bill-to-name', data.billto.billtoname)
    setVal('bill-to-addr', data.billto.billtocomadd + '<br>' + data.billto.phone, true)

    // Ship To (ใช้ข้อมูล billto เพราะ mockup ไม่มี shipto แยก)
    setVal('ship-to-name', data.billto.billtoname)
    setVal('ship-to-addr', data.billto.billtocomadd, true)

    // Invoice Meta
    setVal('invoice-id',   data.invoice.invoicenum)
    setVal('invoice-date', data.invoice.date)
    setVal('po-number',    data.billto.refer)
    setVal('due-date',     data.invoice.due)

    // ── Box3: Items Table ───────────────────────────────────────────────────
    const totals = calculateTotals(data)
    const taxPct = (data.invoice.taxRate * 100).toFixed(2)

    let rows = ''

    // แถวรายการสินค้า
    for (let i = 0; i < data.items.length; i++) {
        const item   = data.items[i]
        const amount = item.quantity * item.unitPrice
        rows += `<tr>
            <td class="px-4 py-2 text-center">${item.quantity}</td>
            <td class="px-4 py-2">${item.name}<br><small class="text-gray-400">${item.description}</small></td>
            <td class="px-4 py-2 text-right">${item.unitPrice.toFixed(2)}</td>
            <td class="px-4 py-2 text-right">${amount.toFixed(2)}</td>
        </tr>`
    }

    // แถว Subtotal
    rows += `<tr>
        <td colspan="3" class="px-4 py-2 text-right">Subtotal</td>
        <td class="px-4 py-2 text-right">${totals.subtotal.toFixed(2)}</td>
    </tr>`

    // แถว Tax
    rows += `<tr>
        <td colspan="3" class="px-4 py-2 text-right">Sales Tax ${taxPct}%</td>
        <td class="px-4 py-2 text-right">${totals.tax.toFixed(2)}</td>
    </tr>`

    // แถว Total
    rows += `<tr style="font-weight: bold;">
        <td colspan="3" class="px-4 py-2 text-right">Total</td>
        <td class="px-4 py-2 text-right">${totals.total.toFixed(2)}</td>
    </tr>`

    const tbody = document.getElementById('invoice-items')
    tbody.innerHTML = rows
    tbody.classList.remove('undefined')

    // ── Box4: Signature ─────────────────────────────────────────────────────
    setVal('signature', '<img class="ml-auto" src="./img/John.PNG" alt="signature" width="150">', true)

    // ── Box5: Conditions ────────────────────────────────────────────────────
    setVal('conditions', data.condition.condi)
})
