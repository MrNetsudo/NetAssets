#!/usr/bin/env python3
"""
Transform hierarchical NMS CSV export to flat NetAssets-compatible format.
Handles dual-schema (device + component) structure.

Author: Claude Code Expert System
Date: 2025-10-29
"""

import csv
import sys
from datetime import datetime

def parse_antilles_csv(input_file):
    """
    Parse hierarchical CSV with alternating device/component rows.

    Structure pattern:
    - Device Header (31 cols)
    - Device Data Row
    - Component Header (15 cols)
    - Component Data Row(s) - 1 to N rows
    - Blank Row
    - [Repeat]
    """
    devices = []

    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    device_header = None
    component_header = None
    current_device = None
    state = 'INIT'  # States: INIT, DEVICE_HEADER, DEVICE_DATA, COMPONENT_HEADER, COMPONENT_DATA

    print(f"📊 Processing {len(lines)} lines...")

    for i, line in enumerate(lines, 1):
        line = line.strip()

        # Skip empty lines
        if not line:
            continue

        cols = list(csv.reader([line]))[0]

        # Detect device header (31 columns, starts with "Status,Device Category")
        if len(cols) >= 30 and cols[0] == 'Status' and cols[1] == 'Device Category':
            # Save previous device before starting new one
            if current_device:
                devices.append(current_device)
                print(f"  → Saved device {len(devices)}")
                current_device = None

            device_header = cols
            state = 'DEVICE_HEADER'
            print(f"  Row {i}: Device header ({len(cols)} columns)")
            continue

        # Detect component header (starts with "Status,Administrative State")
        if len(cols) >= 10 and cols[0] == 'Status' and cols[1] == 'Administrative State':
            component_header = cols
            state = 'COMPONENT_HEADER'
            print(f"  Row {i}: Component header ({len(cols)} columns)")
            continue

        # Device data row (right after device header)
        if state == 'DEVICE_HEADER' and len(cols) >= 25:
            # Check if this looks like device data (has IP address)
            if cols[4] and '.' in str(cols[4]):  # IP address in Management Address column
                current_device = {
                    'device_row': cols,
                    'components': []
                }
                state = 'DEVICE_DATA'
                device_name = cols[2] if len(cols) > 2 else 'Unknown'
                device_ip = cols[4] if len(cols) > 4 else 'N/A'
                print(f"  Row {i}: Device data - {device_name} ({device_ip})")
                continue

        # Component data row (after component header)
        if state in ['COMPONENT_HEADER', 'COMPONENT_DATA'] and current_device and len(cols) >= 5:
            # Skip "Pseudo Chassis" and empty entries
            comp_name = cols[5] if len(cols) > 5 else ''
            comp_sn = cols[8] if len(cols) > 8 else ''

            if 'Pseudo Chassis' not in str(comp_name) and comp_name != 'VDOM':
                current_device['components'].append(cols)
                state = 'COMPONENT_DATA'
                print(f"  Row {i}: Component - {comp_name} (SN: {comp_sn})")
            continue

    # Save last device
    if current_device:
        devices.append(current_device)
        print(f"  → Saved device {len(devices)}")

    return devices, device_header, component_header


def merge_device_component(device_data, component_data, device_header, component_header):
    """
    Merge device and component rows into single flat record.
    Takes the FIRST non-VDOM component with actual hardware data.
    """
    merged = {}

    # Map device fields
    if device_header and device_data:
        for idx, header in enumerate(device_header):
            if idx < len(device_data):
                merged[header] = device_data[idx]

    # Find the best component (skip VDOMs, prefer physical devices with serial numbers)
    best_component = None
    for comp in component_data:
        # Skip VDOMs
        if len(comp) > 5 and comp[5] == 'VDOM':
            continue
        # Prefer components with serial numbers
        if len(comp) > 8 and comp[8]:
            best_component = comp
            break
        # Fallback to any non-VDOM component
        if not best_component:
            best_component = comp

    # Map component fields (if available)
    if best_component and component_header:
        for idx, header in enumerate(component_header):
            if idx < len(best_component) and best_component[idx]:
                # Rename to avoid conflicts
                clean_header = f"Component {header}" if header in device_header else header
                merged[clean_header] = best_component[idx]

    return merged


def write_flat_csv(devices, device_header, component_header, output_file):
    """
    Write flattened CSV with merged device+component data.
    """
    if not devices:
        print("❌ No devices to write!")
        return

    # Build combined header
    # Key fields from device + key fields from component
    output_headers = [
        'Status',
        'Device Category',
        'Name',
        'Hostname',
        'Management Address',
        'Tenant',
        'Security Group',
        'System Location',
        'Device Vendor',
        'Device Family',
        'Device Profile',
        'Model Name',  # From component
        'Serial Number',  # From component
        'Firmware Version',  # From component
        'Hardware Version',  # From component
        'Software Version',  # From component
        'System Description',
        'Node Management Mode',
        'System Object ID',
        'SNMP Agent',
        'Protocol Version',
        'Agent SNMP State',
        'Management Address ICMP State',
        'Status Last Modified',
        'Discovery State',
        'Last Completed',
        'Created',
        'Last Modified',
        'Component Description',  # From component
        'Operational State'  # From component
    ]

    # Column mapping from input to output
    device_col_map = {
        0: 'Status',
        1: 'Device Category',
        2: 'Name',
        3: 'Hostname',
        4: 'Management Address',
        5: 'Tenant',
        6: 'Security Group',
        7: 'System Location',
        20: 'Device Vendor',
        21: 'Device Family',
        8: 'Device Profile',
        17: 'System Description',
        18: 'Node Management Mode',
        19: 'System Object ID',
        22: 'SNMP Agent',
        23: 'Protocol Version',
        24: 'Agent SNMP State',
        25: 'Management Address ICMP State',
        10: 'Status Last Modified',
        27: 'Discovery State',
        28: 'Last Completed',
        29: 'Created',
        30: 'Last Modified'
    }

    component_col_map = {
        6: 'Model Name',  # Column 6 in component row
        8: 'Serial Number',  # Column 8 in component row
        9: 'Firmware Version',
        10: 'Hardware Version',
        11: 'Software Version',
        14: 'Component Description',
        2: 'Operational State'
    }

    print(f"\n📝 Writing flattened CSV to {output_file}...")

    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=output_headers)
        writer.writeheader()

        for device in devices:
            row = {}

            # Extract device fields
            device_row = device['device_row']
            for idx, field in device_col_map.items():
                if idx < len(device_row):
                    row[field] = device_row[idx]

            # Find best component (skip VDOMs, prefer with serial)
            components = device['components']
            best_component = None

            for comp in components:
                # Skip VDOMs and Pseudo Chassis
                if len(comp) > 5 and comp[5] in ['VDOM', 'Pseudo Chassis', 'root', '']:
                    continue
                # Prefer components with serial numbers
                if len(comp) > 8 and comp[8] and comp[8].strip() not in ['-', '', ' ']:
                    best_component = comp
                    break
                # Fallback to any non-empty component
                if not best_component and len(comp) > 5 and comp[5]:
                    best_component = comp

            # Extract component fields
            if best_component:
                for idx, field in component_col_map.items():
                    if idx < len(best_component) and best_component[idx]:
                        row[field] = best_component[idx]

                # Debug: print what we extracted
                if best_component and len(best_component) > 8:
                    model = best_component[6] if len(best_component) > 6 else ''
                    serial = best_component[8] if len(best_component) > 8 else ''

            writer.writerow(row)

    print(f"✅ Wrote {len(devices)} devices to {output_file}")


def main():
    input_file = '/home/michael/Projects/Claude/NetAssets/Antilles_Tenant(in).csv'
    output_file = '/home/michael/Projects/Claude/NetAssets/Antilles_Tenant_FLAT.csv'

    print("=" * 80)
    print("🔧 ANTILLES CSV TRANSFORMATION TOOL")
    print("=" * 80)
    print(f"Input:  {input_file}")
    print(f"Output: {output_file}")
    print()

    # Parse hierarchical CSV
    devices, device_header, component_header = parse_antilles_csv(input_file)

    print(f"\n📊 Extraction Summary:")
    print(f"  Devices found: {len(devices)}")
    for i, dev in enumerate(devices[:5], 1):
        dev_name = dev['device_row'][2] if len(dev['device_row']) > 2 else 'Unknown'
        comp_count = len(dev['components'])
        print(f"    {i}. {dev_name} - {comp_count} components")

    # Write flattened CSV
    write_flat_csv(devices, device_header, component_header, output_file)

    print("\n" + "=" * 80)
    print("✅ TRANSFORMATION COMPLETE")
    print("=" * 80)
    print(f"\n💡 Next step: Import {output_file} into NetAssets")
    print()


if __name__ == '__main__':
    main()
